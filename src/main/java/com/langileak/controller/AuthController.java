package com.langileak.controller;

import com.langileak.model.Usuario;
import com.langileak.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/register")
    public String registrar(@RequestBody Usuario usuario) {

        String username = usuario.getUsername();
        String password = usuario.getPassword();

        if (username.trim().isEmpty() || password.trim().isEmpty()) {
            return "Errorea: Eremuak ezin dira hutsik egon.";
        }

        if (usuarioRepository.findByUsername(username).isPresent()) {
            return "Errorea: Erabiltzailea existitzen da.";
        }

        usuarioRepository.save(new Usuario(username, password));

        return "OK";
    }

    @PostMapping("/login")
    public String login(@RequestBody Usuario usuario) {

        Optional<Usuario> user =
                usuarioRepository.findByUsername(usuario.getUsername());

        if (!user.isPresent()) {
            return "Ez da existitzen";
        }

        if (user.get().getPassword().equals(usuario.getPassword())) {
            return "OK";
        }

        return "Pasahitz okerra";
    }
}