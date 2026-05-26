package com.langileak;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.*;
import java.util.Optional;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

@Entity
@Table(name = "usuarios")
class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String username;
    private String password;

    public Usuario() {}
    public Usuario(String username, String password) {
        this.username = username;
        this.password = password;
    }
    
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
}

@RestController
@RequestMapping("/api")
class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/register")
    public String registrar(@RequestParam String username, @RequestParam String password) {
        if (username.trim().isEmpty() || password.trim().isEmpty()) {
            return "Errorea: Eremuak ezin dira hutsik egon.";
        }
        if(usuarioRepository.findByUsername(username).isPresent()) {
            return "Errorea: Erabiltzailea existitzen da.";
        }
        usuarioRepository.save(new Usuario(username, password));
        return "OK";
    }

    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password) {
        Optional<Usuario> user = usuarioRepository.findByUsername(username);
        if (!user.isPresent()) {
            return "Ez da existitzen"; // Usuario no existe
        }
        if (user.get().getPassword().equals(password)) {
            return "OK"; // Login correcto
        } else {
            return "Pasahitz okerra"; // Contraseña incorrecta
        }
    }
}