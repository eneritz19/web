package com.ecomove.model;

public record Trip(
        long id,
        String from,
        String to,
        String km,
        String co2,
        String mode,
        String date,
        String icon,
        String points
) {}
