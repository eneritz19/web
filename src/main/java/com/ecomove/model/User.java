package com.ecomove.model;

public record User(
        long usuarioID,
        long empresaID,
        String nombre,
        String apellido,
        String email,
        String password,
        String modelococheID,
        String publiCiudad
) {}
