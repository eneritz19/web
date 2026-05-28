package com.ecomove.service;

import com.ecomove.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EcoMoveService {

    private static final String TRIPS_FILE = "viajes.csv";
    private static final String REWARDS_FILE = "recompensas.csv";
    private static final String REDEMPTIONS_FILE = "canjeos.csv";
    private static final String LINES_FILE = "lineas_transporte.csv";
    private static final String STOPS_FILE = "paradas_transporte.csv";
    private static final String ROUTES_FILE = "rutas_recomendadas.csv";
    private static final String ROUTE_STEPS_FILE = "ruta_pasos.csv";
    private static final String OFFERS_FILE = "carpool_ofertas.csv";
    private static final String JOINS_FILE = "carpool_uniones.csv";

    private static final List<String> TRIP_HEADERS = List.of(
            "tripID", "userID", "fecha", "origen", "destino", "km", "co2", "modo", "duracionMin", "puntos", "icono"
    );
    private static final List<String> REDEMPTION_HEADERS = List.of("redencionID", "userID", "rewardID", "fecha", "puntos");
    private static final List<String> OFFER_HEADERS = List.of("offerID", "userID", "origen", "destino", "time", "seats", "active", "distance", "rating");
    private static final List<String> JOIN_HEADERS = List.of("joinID", "userID", "riderName", "fecha");

    private final UserCsvService userCsvService;
    private final CsvDataService csv;

    public EcoMoveService(UserCsvService userCsvService, CsvDataService csv) {
        this.userCsvService = userCsvService;
        this.csv = csv;
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOptional = userCsvService.findByNombreUsuario(request.nombreUsuario());

        if (userOptional.isEmpty()) {
            return new AuthResponse(false, "Usuario no encontrado", null);
        }

        User user = userOptional.get();

        if (!user.contrasena().equals(request.contrasena())) {
            return new AuthResponse(false, "Contraseña incorrecta", null);
        }

        return new AuthResponse(true, "Login correcto", buildProfile(user));
    }

    public AuthResponse register(RegisterRequest request) {
        if (userCsvService.findByNombreUsuario(request.nombreUsuario()).isPresent()) {
            return new AuthResponse(false, "El nombre de usuario ya existe", null);
        }

        if (request.email() != null && !request.email().isBlank() && userCsvService.findByEmail(request.email()).isPresent()) {
            return new AuthResponse(false, "El email ya existe", null);
        }

        String modeloCoche = request.tieneCoche()
                ? safe(request.modeloCocheID(), "SIN_COCHE")
                : "SIN_COCHE";

        long newId = userCsvService.nextUserId();
        String email = request.email() == null || request.email().isBlank()
                ? request.nombreUsuario() + "@ecomove.local"
                : request.email();

        User user = new User(
                newId,
                request.empresaID(),
                request.nombre(),
                request.apellidos(),
                request.nombreUsuario(),
                request.contrasena(),
                email,
                request.tieneCoche(),
                modeloCoche,
                request.puebloCiudad()
        );

        userCsvService.saveUser(user);

        return new AuthResponse(true, "Usuario registrado correctamente", buildProfile(user));
    }

    public UserProfile getProfile(long userId) {
        return buildProfile(getUser(userId));
    }

    public DashboardResponse getDashboard(long userId) {
        User user = getUser(userId);
        return new DashboardResponse(
                buildProfile(user),
                getStats(user.userID()),
                getMonthlyStats(user.userID()),
                getTransportShare(user.userID()),
                getRecentTrips(user.userID()),
                getRecommendedRoute(user.userID())
        );
    }

    public List<StatCard> getStats(long userId) {
        List<Map<String, String>> trips = userTripRows(userId);
        double co2 = trips.stream().mapToDouble(row -> parseDouble(row.get("co2"))).sum();
        double cleanKm = trips.stream()
                .filter(row -> !row.getOrDefault("modo", "").equalsIgnoreCase("Autoa"))
                .mapToDouble(row -> parseDouble(row.get("km"))).sum();
        int points = trips.stream().mapToInt(row -> parseInt(row.get("puntos"))).sum() - redeemedPoints(userId);
        int tripCount = trips.size();
        int level = Math.max(1, 1 + points / 250);

        return List.of(
                new StatCard("CO₂ Aurreztua", formatKg(co2), "Datuak data/viajes.csv fitxategitik", "🌳", "green"),
                new StatCard("Bidaiak", String.valueOf(tripCount), "Erabiltzaile honen bidaiak", "🧭", "blue"),
                new StatCard("Nire Puntuak", formatNumber(points), "Canjeoak kenduta", "⭐", "yellow"),
                new StatCard("Km garbi", formatOne(cleanKm) + " km", "Autorik gabe", "🚆", "purple")
        );
    }

    public List<MonthlyStat> getMonthlyStats(long userId) {
        Map<String, double[]> byMonth = new LinkedHashMap<>();

        for (Map<String, String> row : userTripRows(userId)) {
            String month = monthName(row.get("fecha"));
            double[] values = byMonth.computeIfAbsent(month, key -> new double[]{0.0, 0.0});
            values[0] += parseDouble(row.get("co2"));
            values[1] += parseDouble(row.get("km"));
        }

        return byMonth.entrySet().stream()
                .map(entry -> new MonthlyStat(entry.getKey(), roundOne(entry.getValue()[0]), (int) Math.round(entry.getValue()[1])))
                .toList();
    }

    public List<TransportShare> getTransportShare(long userId) {
        List<Map<String, String>> trips = userTripRows(userId);

        if (trips.isEmpty()) {
            return List.of();
        }

        Map<String, Long> counts = trips.stream().collect(Collectors.groupingBy(
                row -> row.getOrDefault("modo", "Besteak"),
                LinkedHashMap::new,
                Collectors.counting()
        ));

        int total = trips.size();
        return counts.entrySet().stream()
                .map(entry -> new TransportShare(entry.getKey(), (int) Math.round((entry.getValue() * 100.0) / total)))
                .toList();
    }

    public List<Trip> getRecentTrips(long userId) {
        return userTripRows(userId).stream()
                .sorted(Comparator.comparing((Map<String, String> row) -> row.getOrDefault("fecha", "")).reversed())
                .limit(8)
                .map(this::toTrip)
                .toList();
    }

    public RouteRecommendation getRecommendedRoute(long userId) {
        Optional<Map<String, String>> route = csv.readRows(ROUTES_FILE).stream()
                .filter(row -> parseLong(row.get("userID")) == userId)
                .findFirst();

        Map<String, String> row = route.orElseGet(() -> csv.readRows(ROUTES_FILE).stream().findFirst().orElse(Map.of()));
        long routeId = parseLong(row.get("routeID"));

        List<RouteStep> steps = csv.readRows(ROUTE_STEPS_FILE).stream()
                .filter(step -> parseLong(step.get("routeID")) == routeId)
                .sorted(Comparator.comparingInt(step -> parseInt(step.get("orden"))))
                .map(step -> new RouteStep(
                        step.getOrDefault("icon", "•"),
                        step.getOrDefault("label", "Pausoa"),
                        step.getOrDefault("detail", "")
                ))
                .toList();

        return new RouteRecommendation(
                row.getOrDefault("origen", "Bilbo"),
                row.getOrDefault("destino", "Getxo"),
                row.getOrDefault("duracion", "0 min"),
                row.getOrDefault("distance", "0 km"),
                row.getOrDefault("co2", "0 kg"),
                steps
        );
    }

    public List<Rider> getRiders(long userId) {
        List<User> users = userCsvService.getAllUsers();

        return csv.readRows(OFFERS_FILE).stream()
                .filter(row -> Boolean.parseBoolean(row.getOrDefault("active", "false")))
                .filter(row -> parseLong(row.get("userID")) != userId)
                .map(row -> {
                    User driver = users.stream()
                            .filter(user -> user.userID() == parseLong(row.get("userID")))
                            .findFirst()
                            .orElse(null);

                    if (driver == null) {
                        return null;
                    }

                    String company = userCsvService.findCompany(driver.empresaID())
                            .map(Empresa::nombre)
                            .orElse("EcoMove");

                    return new Rider(
                            parseLong(row.get("offerID")),
                            driver.nombre() + " " + driver.apellidos(),
                            row.getOrDefault("distance", "0 km"),
                            parseDouble(row.get("rating")),
                            row.getOrDefault("origen", "") + " → " + row.getOrDefault("destino", ""),
                            row.getOrDefault("time", ""),
                            driver.modeloCocheID().toUpperCase().contains("TESLA") || driver.modeloCocheID().toUpperCase().contains("EV"),
                            getInitials(driver.nombre() + " " + driver.apellidos()),
                            company
                    );
                })
                .filter(rider -> rider != null)
                .toList();
    }

    public List<TransportLine> getTransportLines() {
        return csv.readRows(LINES_FILE).stream().map(row -> new TransportLine(
                row.getOrDefault("id", ""),
                row.getOrDefault("name", ""),
                row.getOrDefault("color", "#16a34a"),
                parseInt(row.get("minutes")),
                row.getOrDefault("status", "garaiz"),
                parseInt(row.get("stops"))
        )).toList();
    }

    public List<TransportStop> getTransportStops(String proveedor, Integer limit) {
        int max = limit == null || limit <= 0 ? 40 : Math.min(limit, 250);
        String filter = proveedor == null ? "" : proveedor.trim();

        return csv.readRows(STOPS_FILE).stream()
                .filter(row -> filter.isBlank() || row.getOrDefault("proveedor", "").equalsIgnoreCase(filter))
                .limit(max)
                .map(row -> new TransportStop(
                        row.getOrDefault("paradaID", ""),
                        row.getOrDefault("proveedor", ""),
                        row.getOrDefault("stopID", ""),
                        row.getOrDefault("stopCode", ""),
                        row.getOrDefault("nombre", ""),
                        row.getOrDefault("descripcion", ""),
                        parseDouble(row.get("latitud")),
                        parseDouble(row.get("longitud")),
                        row.getOrDefault("zona", ""),
                        row.getOrDefault("municipio", ""),
                        row.getOrDefault("locationType", ""),
                        row.getOrDefault("accesible", "")
                ))
                .toList();
    }

    public List<Reward> getRewards(String category) {
        List<Reward> rewards = csv.readRows(REWARDS_FILE).stream().map(row -> new Reward(
                parseLong(row.get("rewardID")),
                row.getOrDefault("title", ""),
                parseInt(row.get("points")),
                row.getOrDefault("emoji", "🎁"),
                row.getOrDefault("category", "")
        )).toList();

        if (category == null || category.isBlank() || category.equalsIgnoreCase("Guztiak")) {
            return rewards;
        }

        return rewards.stream()
                .filter(reward -> reward.category().equalsIgnoreCase(category))
                .toList();
    }

    public TrackingStatus startTracking(String mode) {
        String selectedMode = mode == null || mode.isBlank() ? "Autobusa" : mode;
        return new TrackingStatus(true, selectedMode, "0.0 km", "00:00", "0 kg", 0);
    }

    public TrackingStatus stopTracking(long userId, String mode) {
        String selectedMode = mode == null || mode.isBlank() ? "Autobusa" : mode;
        double km = switch (selectedMode) {
            case "Oinez" -> 2.4;
            case "Bizikleta" -> 4.8;
            case "Karpoola" -> 14.2;
            default -> 12.5;
        };
        double co2 = selectedMode.equalsIgnoreCase("Autoa") ? 0.0 : roundOne(km * 0.15);
        int points = switch (selectedMode) {
            case "Oinez" -> 8;
            case "Bizikleta" -> 12;
            case "Karpoola" -> 15;
            default -> 10;
        };

        long tripId = csv.nextId(TRIPS_FILE, "tripID");
        String icon = iconForMode(selectedMode);
        csv.appendRow(TRIPS_FILE, TRIP_HEADERS, List.of(
                String.valueOf(tripId),
                String.valueOf(userId),
                LocalDate.now().toString(),
                getUser(userId).puebloCiudad(),
                "EcoMove helmuga",
                formatOne(km),
                formatOne(co2),
                selectedMode,
                "30",
                String.valueOf(points),
                icon
        ));

        return new TrackingStatus(false, selectedMode, formatOne(km) + " km", "30 min", formatOne(co2) + " kg", points);
    }

    public void offerTrip(long userId, CarpoolOfferRequest request) {
        csv.appendRow(OFFERS_FILE, OFFER_HEADERS, List.of(
                String.valueOf(csv.nextId(OFFERS_FILE, "offerID")),
                String.valueOf(userId),
                safe(request.from(), ""),
                safe(request.to(), ""),
                safe(request.time(), "08:30"),
                String.valueOf(request.seats() <= 0 ? 1 : request.seats()),
                "true",
                "0.5 km",
                "4.7"
        ));
    }

    public void joinRide(long userId, String riderName) {
        csv.appendRow(JOINS_FILE, JOIN_HEADERS, List.of(
                String.valueOf(csv.nextId(JOINS_FILE, "joinID")),
                String.valueOf(userId),
                safe(riderName, ""),
                LocalDate.now().toString()
        ));
    }

    public boolean redeemReward(long userId, long rewardId) {
        Optional<Reward> reward = getRewards(null).stream().filter(item -> item.id() == rewardId).findFirst();
        if (reward.isEmpty()) {
            return false;
        }

        int availablePoints = userTripRows(userId).stream().mapToInt(row -> parseInt(row.get("puntos"))).sum() - redeemedPoints(userId);
        if (availablePoints < reward.get().points()) {
            return false;
        }

        csv.appendRow(REDEMPTIONS_FILE, REDEMPTION_HEADERS, List.of(
                String.valueOf(csv.nextId(REDEMPTIONS_FILE, "redencionID")),
                String.valueOf(userId),
                String.valueOf(rewardId),
                LocalDate.now().toString(),
                String.valueOf(reward.get().points())
        ));
        return true;
    }

    public CorporateDashboard getCorporateDashboard(long userId) {
        User currentUser = getUser(userId);
        long empresaID = currentUser.empresaID();
        List<User> companyUsers = userCsvService.getAllUsers().stream()
                .filter(user -> user.empresaID() == empresaID)
                .toList();
        List<Long> userIds = companyUsers.stream().map(User::userID).toList();
        List<Map<String, String>> companyTrips = csv.readRows(TRIPS_FILE).stream()
                .filter(row -> userIds.contains(parseLong(row.get("userID"))))
                .toList();

        double co2 = companyTrips.stream().mapToDouble(row -> parseDouble(row.get("co2"))).sum();
        int points = companyTrips.stream().mapToInt(row -> parseInt(row.get("puntos"))).sum();
        long autoTrips = companyTrips.stream().filter(row -> row.getOrDefault("modo", "").equalsIgnoreCase("Autoa")).count();
        int autoPercent = companyTrips.isEmpty() ? 0 : (int) Math.round(autoTrips * 100.0 / companyTrips.size());

        List<CorporateKpi> kpis = List.of(
                new CorporateKpi("CO₂ Aurreztua", formatKg(co2), "CSV bidez", "🌳", "green"),
                new CorporateKpi("Ibilaldi Aktiboak", String.valueOf(companyTrips.size()), "Enpresako bidaiak", "👥", "blue"),
                new CorporateKpi("Auto Erabilera", autoPercent + "%", "Autoa moduko bidaiak", "🚗", "yellow"),
                new CorporateKpi("Puntuak Irabazi", formatNumber(points), "Langileen guztira", "⭐", "purple")
        );

        Map<String, double[]> monthly = new LinkedHashMap<>();
        for (Map<String, String> row : companyTrips) {
            String month = monthName(row.get("fecha"));
            double[] values = monthly.computeIfAbsent(month, key -> new double[]{0.0, 0.0});
            values[0] += parseDouble(row.get("co2"));
            values[1] += 1;
        }

        List<CorporateMonthlyStat> monthlyStats = monthly.entrySet().stream()
                .map(entry -> new CorporateMonthlyStat(entry.getKey(), (int) Math.round(entry.getValue()[0]), (int) Math.round(entry.getValue()[1])))
                .toList();

        List<Employee> topEmployees = companyUsers.stream()
                .map(user -> {
                    List<Map<String, String>> trips = userTripRows(user.userID());
                    int tripCount = trips.size();
                    int userPoints = trips.stream().mapToInt(row -> parseInt(row.get("puntos"))).sum();
                    double userCo2 = trips.stream().mapToDouble(row -> parseDouble(row.get("co2"))).sum();
                    return new Employee(0, user.nombre() + " " + user.apellidos(), getInitials(user.nombre() + " " + user.apellidos()), user.puebloCiudad(), tripCount, formatKg(userCo2), userPoints);
                })
                .sorted(Comparator.comparingInt(Employee::points).reversed())
                .toList();

        List<Employee> ranked = new ArrayList<>();
        for (int i = 0; i < topEmployees.size(); i++) {
            Employee e = topEmployees.get(i);
            ranked.add(new Employee(i + 1, e.name(), e.initials(), e.department(), e.trips(), e.co2Saved(), e.points()));
        }

        Map<String, Long> byCity = companyUsers.stream().collect(Collectors.groupingBy(User::puebloCiudad, LinkedHashMap::new, Collectors.counting()));
        List<DepartmentParticipation> departments = byCity.entrySet().stream()
                .map(entry -> new DepartmentParticipation(entry.getKey(), (int) Math.round(entry.getValue() * 100.0 / companyUsers.size()), entry.getValue().intValue()))
                .toList();

        return new CorporateDashboard(kpis, monthlyStats, ranked, departments);
    }

    public List<Empresa> getCompanies() {
        return userCsvService.getCompanies();
    }

    public List<CarModel> getCarModels() {
        return userCsvService.getCarModels();
    }

    public String exportCsv(String filename) {
        return csv.readRaw(filename);
    }

    public String dataDirectory() {
        return csv.getDataDir().toString();
    }

    private UserProfile buildProfile(User user) {
        String organization = userCsvService.findCompany(user.empresaID()).map(Empresa::nombre).orElse("EcoMove");
        List<Map<String, String>> trips = userTripRows(user.userID());
        int totalPoints = trips.stream().mapToInt(row -> parseInt(row.get("puntos"))).sum() - redeemedPoints(user.userID());
        double co2 = trips.stream().mapToDouble(row -> parseDouble(row.get("co2"))).sum();
        int level = Math.max(1, 1 + totalPoints / 250);

        return new UserProfile(
                user.userID(),
                user.nombre() + " " + user.apellidos(),
                getInitials(user.nombre() + " " + user.apellidos()),
                user.email(),
                organization,
                user.puebloCiudad(),
                level,
                totalPoints,
                trips.size(),
                formatKg(co2),
                badgeForPoints(totalPoints),
                user.empresaID(),
                user.nombreUsuario(),
                user.tieneCoche(),
                user.modeloCocheID(),
                user.puebloCiudad()
        );
    }

    private User getUser(long userId) {
        return userCsvService.findById(userId)
                .orElseGet(() -> userCsvService.getAllUsers().stream().findFirst()
                        .orElseThrow(() -> new IllegalStateException("No hay usuarios en data/usuarios.csv")));
    }

    private List<Map<String, String>> userTripRows(long userId) {
        return csv.readRows(TRIPS_FILE).stream()
                .filter(row -> parseLong(row.get("userID")) == userId)
                .toList();
    }

    private Trip toTrip(Map<String, String> row) {
        return new Trip(
                parseLong(row.get("tripID")),
                row.getOrDefault("origen", ""),
                row.getOrDefault("destino", ""),
                formatOne(parseDouble(row.get("km"))) + " km",
                formatOne(parseDouble(row.get("co2"))) + " kg",
                row.getOrDefault("modo", ""),
                row.getOrDefault("fecha", ""),
                row.getOrDefault("icono", iconForMode(row.getOrDefault("modo", ""))),
                "+" + parseInt(row.get("puntos")) + " pts"
        );
    }

    private int redeemedPoints(long userId) {
        return csv.readRows(REDEMPTIONS_FILE).stream()
                .filter(row -> parseLong(row.get("userID")) == userId)
                .mapToInt(row -> parseInt(row.get("puntos")))
                .sum();
    }

    private String badgeForPoints(int points) {
        if (points >= 1000) return "Ekologista Aurreratua";
        if (points >= 500) return "Bidaiari Berdea";
        if (points >= 100) return "Ekologista";
        return "Hasiberria";
    }

    private String getInitials(String name) {
        String[] parts = name == null ? new String[0] : name.trim().split("\\s+");
        if (parts.length == 0 || parts[0].isBlank()) {
            return "EM";
        }
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
        return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
    }

    private String iconForMode(String mode) {
        return switch (mode == null ? "" : mode) {
            case "Oinez" -> "🚶";
            case "Bizikleta" -> "🚲";
            case "Metroa" -> "🚇";
            case "Tranbaia" -> "🚋";
            case "Karpoola" -> "🚗";
            case "Autoa" -> "🚘";
            default -> "🚌";
        };
    }

    private String monthName(String dateValue) {
        try {
            int month = LocalDate.parse(dateValue, DateTimeFormatter.ISO_LOCAL_DATE).getMonthValue();
            return switch (month) {
                case 1 -> "Urt";
                case 2 -> "Ots";
                case 3 -> "Mar";
                case 4 -> "Api";
                case 5 -> "Mai";
                case 6 -> "Eka";
                case 7 -> "Uzt";
                case 8 -> "Abu";
                case 9 -> "Ira";
                case 10 -> "Urr";
                case 11 -> "Aza";
                case 12 -> "Abe";
                default -> "?";
            };
        } catch (Exception e) {
            return "?";
        }
    }

    private String formatKg(double value) {
        return formatOne(value) + " kg";
    }

    private String formatOne(double value) {
        return String.format(java.util.Locale.US, "%.1f", value);
    }

    private String formatNumber(int value) {
        return String.format(java.util.Locale.GERMANY, "%d", value);
    }

    private double roundOne(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private int parseInt(String value) {
        try {
            return Integer.parseInt(value == null || value.isBlank() ? "0" : value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private long parseLong(String value) {
        try {
            return Long.parseLong(value == null || value.isBlank() ? "0" : value);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    private double parseDouble(String value) {
        try {
            return Double.parseDouble(value == null || value.isBlank() ? "0" : value);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
