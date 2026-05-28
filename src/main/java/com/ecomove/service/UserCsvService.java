package com.ecomove.service;

import com.ecomove.model.User;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserCsvService {

    private static final String FILE_PATH = "src/main/resources/data/users.csv";

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();

        try (BufferedReader br = Files.newBufferedReader(Paths.get(FILE_PATH))) {

            String line;
            boolean firstLine = true;

            while ((line = br.readLine()) != null) {

                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                String[] data = line.split(",");

                User user = new User(
                        Long.parseLong(data[0]),
                        Long.parseLong(data[1]),
                        data[2],
                        data[3],
                        data[4],
                        data[5],
                        data[6],
                        data[7]
                );

                users.add(user);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        return users;
    }

    public void saveUser(User user) {

        try (BufferedWriter bw = Files.newBufferedWriter(
                Paths.get(FILE_PATH),
                StandardOpenOption.APPEND
        )) {

            bw.newLine();

            bw.write(
                    user.usuarioID() + "," +
                    user.empresaID() + "," +
                    user.nombre() + "," +
                    user.apellido() + "," +
                    user.email() + "," +
                    user.password() + "," +
                    user.modelococheID() + "," +
                    user.publiCiudad()
            );

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Optional<User> findByEmail(String email) {

        return getAllUsers()
                .stream()
                .filter(user -> user.email().equalsIgnoreCase(email))
                .findFirst();
    }
}