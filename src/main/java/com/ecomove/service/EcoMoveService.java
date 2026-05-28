package com.ecomove.service;

import com.ecomove.model.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EcoMoveService {

    private final UserProfile currentUser = new UserProfile(
            1L,
            "Jon Urrutia",
            "JU",
            "jon.urrutia@ecomove.eus",
            "Bizkaiko Foru Aldundia",
            "IT Saila",
            5,
            1240,
            47,
            "847 kg",
            "Ekologista Aurreratua"
    );

    public UserProfile getCurrentUser() {
        return currentUser;
    }

    public AuthResponse login(AuthRequest request) {
        return new AuthResponse(true, "Login correcto. Datos simulados para el prototipo.", currentUser);
    }

    public AuthResponse register(AuthRequest request) {
        String name = request.name() == null || request.name().isBlank() ? "Erabiltzaile berria" : request.name();
        UserProfile newUser = new UserProfile(
                2L,
                name,
                getInitials(name),
                request.email(),
                "EcoMove",
                "Erabiltzailea",
                1,
                0,
                0,
                "0 kg",
                "Hasiberria"
        );
        return new AuthResponse(true, "Registro correcto. Datos simulados para el prototipo.", newUser);
    }

    public DashboardResponse getDashboard() {
        return new DashboardResponse(
                currentUser,
                getStats(),
                getMonthlyStats(),
                getTransportShare(),
                getRecentTrips(),
                getRecommendedRoute()
        );
    }

    public List<StatCard> getStats() {
        return List.of(
                new StatCard("CO₂ Aurreztua", "847 kg", "Aurten · %23↓ iaz baino", "🌳", "green"),
                new StatCard("Bidaiak", "47", "Azken 30 egunetan", "🧭", "blue"),
                new StatCard("Nire Puntuak", "1.240", "+180 aste honetan", "⭐", "yellow"),
                new StatCard("Km garbi", "312 km", "Autorik gabe", "🚆", "purple")
        );
    }

    public List<MonthlyStat> getMonthlyStats() {
        return List.of(
                new MonthlyStat("Urt", 18.2, 62),
                new MonthlyStat("Ots", 14.5, 51),
                new MonthlyStat("Mar", 16.8, 58),
                new MonthlyStat("Api", 11.2, 42),
                new MonthlyStat("Mai", 8.7, 35),
                new MonthlyStat("Eka", 6.1, 28)
        );
    }

    public List<TransportShare> getTransportShare() {
        return List.of(
                new TransportShare("Oinez", 32),
                new TransportShare("Bizikleta", 24),
                new TransportShare("Autobusa", 30),
                new TransportShare("Autoa", 14)
        );
    }

    public List<Trip> getRecentTrips() {
        return List.of(
                new Trip(1, "Bilbo", "Getxo", "18.2 km", "0 kg", "Autobusa", "Gaur, 08:32", "🚌", "+12 pts"),
                new Trip(2, "Bilbo", "Basauri", "12.4 km", "0 kg", "Metroa", "Atzo, 17:45", "🚇", "+8 pts"),
                new Trip(3, "Leioa", "Bilbo", "15.8 km", "0.3 kg", "Karpoola", "Atz.-herenegun", "🚗", "+15 pts"),
                new Trip(4, "Bilbo", "Sestao", "9.1 km", "0 kg", "Tranbaia", "Dema.", "🚋", "+6 pts")
        );
    }

    public RouteRecommendation getRecommendedRoute() {
        return new RouteRecommendation(
                "Bilbo · Abando",
                "Getxo · Las Arenas",
                "38 min",
                "18.2 km",
                "0 kg",
                List.of(
                        new RouteStep("🚶", "Oinez", "5 min"),
                        new RouteStep("🚇", "Metro M1", "20 min"),
                        new RouteStep("🚌", "Autobusa A3", "13 min")
                )
        );
    }

    public List<Rider> getRiders() {
        return List.of(
                new Rider(1, "Ane Zabala", "0.3 km", 4.8, "Bilbo → Getxo", "08:15", true, "AZ", "IT Saila"),
                new Rider(2, "Mikel Etxea", "0.7 km", 4.6, "Bilbo → Basauri", "08:30", true, "ME", "Finantza"),
                new Rider(3, "Leire Aguirre", "1.2 km", 4.9, "Bilbo → Leioa", "09:00", false, "LA", "GGH Saila"),
                new Rider(4, "Josu Mendiz.", "1.5 km", 4.7, "Bilbo → Derio", "09:15", true, "JM", "Komunikazioa"),
                new Rider(5, "Izaro Uriarte", "2.1 km", 4.5, "Bilbo → Sestao", "09:30", false, "IU", "IT Saila"),
                new Rider(6, "Gorka Azkue", "2.4 km", 4.8, "Bilbo → Erandio", "07:45", true, "GA", "Legala")
        );
    }

    public List<TransportLine> getTransportLines() {
        return List.of(
                new TransportLine("A3", "Bilbo – Getxo", "#16a34a", 3, "garaiz", 12),
                new TransportLine("B1", "Bilbo – Basauri", "#0ea5e9", 7, "garaiz", 8),
                new TransportLine("M1", "Metro Linia 1", "#7c3aed", 2, "garaiz", 24),
                new TransportLine("M2", "Metro Linia 2", "#d97706", 5, "atzeratua", 18),
                new TransportLine("T1", "Tranbaia", "#db2777", 4, "garaiz", 15),
                new TransportLine("C2", "Bilbo – Leioa", "#0284c7", 6, "garaiz", 10)
        );
    }

    public List<Reward> getRewards(String category) {
        List<Reward> rewards = List.of(
                new Reward(1, "Kafe bat doan", 150, "☕", "Janaria"),
                new Reward(2, "%15 Bizikletetan", 200, "🚲", "Garraioa"),
                new Reward(3, "Denda bertakoa", 300, "🛍️", "Erosketak"),
                new Reward(4, "Bide Berde Bono", 500, "🌿", "Natura"),
                new Reward(5, "Zinema sarrera", 400, "🎬", "Aisia"),
                new Reward(6, "Yoga klasea", 250, "🧘", "Osasuna"),
                new Reward(7, "Liburutegi bono", 180, "📚", "Aisia"),
                new Reward(8, "Fruta saskia", 220, "🍎", "Janaria")
        );

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

    public TrackingStatus stopTracking() {
        return new TrackingStatus(false, "Autobusa", "18.2 km", "38 min", "2.8 kg", 12);
    }

    public CorporateDashboard getCorporateDashboard() {
        return new CorporateDashboard(
                List.of(
                        new CorporateKpi("CO₂ Aurreztua", "2.4 t", "+18%", "🌳", "green"),
                        new CorporateKpi("Ibilaldi Aktiboak", "1.247", "+32%", "👥", "blue"),
                        new CorporateKpi("Auto Erabilera", "34%", "−12%", "🚗", "yellow"),
                        new CorporateKpi("Puntuak Irabazi", "48.2k", "+24%", "⭐", "purple")
                ),
                List.of(
                        new CorporateMonthlyStat("Urt", 380, 45),
                        new CorporateMonthlyStat("Ots", 310, 52),
                        new CorporateMonthlyStat("Mar", 420, 61),
                        new CorporateMonthlyStat("Api", 280, 78),
                        new CorporateMonthlyStat("Mai", 210, 92),
                        new CorporateMonthlyStat("Eka", 156, 108)
                ),
                List.of(
                        new Employee(1, "Amaia Larrea", "AL", "IT Saila", 58, "124 kg", 2840),
                        new Employee(2, "Mikel Garmendia", "MG", "Finantza", 45, "98 kg", 2210),
                        new Employee(3, "Nerea Beitia", "NB", "GGH Saila", 41, "87 kg", 1980),
                        new Employee(4, "Aitor Zubikarai", "AZ", "IT Saila", 38, "81 kg", 1740),
                        new Employee(5, "Maite Altuna", "MA", "Komunikazioa", 33, "72 kg", 1520)
                ),
                List.of(
                        new DepartmentParticipation("IT Saila", 78, 34),
                        new DepartmentParticipation("GGH Saila", 62, 27),
                        new DepartmentParticipation("Finantza", 54, 23),
                        new DepartmentParticipation("Komunikazioa", 45, 19),
                        new DepartmentParticipation("Legala", 38, 16)
                )
        );
    }

    private String getInitials(String name) {
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
        return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
    }
}
