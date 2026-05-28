package com.ecomove.controller;

import com.ecomove.model.*;
import com.ecomove.service.EcoMoveService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class EcoMoveController {

    private final EcoMoveService service;

    public EcoMoveController(EcoMoveService service) {
        this.service = service;
    }

    @PostMapping("/auth/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return service.login(request);
    }

    @PostMapping("/auth/register")
    public AuthResponse register(@Valid @RequestBody AuthRequest request) {
        return service.register(request);
    }

    @GetMapping("/profile")
    public UserProfile profile() {
        return service.getCurrentUser();
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return service.getDashboard();
    }

    @GetMapping("/stats")
    public List<MonthlyStat> stats() {
        return service.getMonthlyStats();
    }

    @GetMapping("/transport-share")
    public List<TransportShare> transportShare() {
        return service.getTransportShare();
    }

    @GetMapping("/trips")
    public List<Trip> trips() {
        return service.getRecentTrips();
    }

    @GetMapping("/riders")
    public List<Rider> riders() {
        return service.getRiders();
    }

    @GetMapping("/transport-lines")
    public List<TransportLine> transportLines() {
        return service.getTransportLines();
    }

    @GetMapping("/rewards")
    public List<Reward> rewards(@RequestParam(required = false) String category) {
        return service.getRewards(category);
    }

    @GetMapping("/route/recommended")
    public RouteRecommendation recommendedRoute() {
        return service.getRecommendedRoute();
    }

    @PostMapping("/tracking/start")
    public TrackingStatus startTracking(@RequestParam(required = false) String mode) {
        return service.startTracking(mode);
    }

    @PostMapping("/tracking/stop")
    public TrackingStatus stopTracking() {
        return service.stopTracking();
    }

    @GetMapping("/corporate")
    public CorporateDashboard corporate() {
        return service.getCorporateDashboard();
    }
}
