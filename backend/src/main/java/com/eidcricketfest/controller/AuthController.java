package com.eidcricketfest.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eidcricketfest.entity.AppUser;
import com.eidcricketfest.repository.AppUserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

  private final AppUserRepository appUserRepository;
  private final BCryptPasswordEncoder passwordEncoder;

  @PostMapping("/login")
  public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> creds) {
    String username = creds.get("username");
    String password = creds.get("password");

    if (username == null || username.trim().isEmpty() || password == null) {
      return ResponseEntity.status(400).body(Map.of("error", "Username and password are required"));
    }

    Optional<AppUser> userOpt = appUserRepository.findByUsername(username);
    if (userOpt.isEmpty()) {
      return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }

    AppUser user = userOpt.get();

    // Use bcrypt for password verification
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }

    Map<String, String> response = new HashMap<>();
    response.put("username", user.getUsername());
    response.put("role", user.getRole().name());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/me")
  public ResponseEntity<Map<String, String>> me(@RequestHeader("X-Username") String username) {
    return appUserRepository.findByUsername(username)
        .map(u -> ResponseEntity.ok(Map.of("username", u.getUsername(), "role", u.getRole().name())))
        .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Not authenticated")));
  }
}
