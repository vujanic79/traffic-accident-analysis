package com.analizasn.traffic_accident_analysis_backend.service;

import java.util.Map;

public interface ThymeleafService {
    String createContent(String template, Map<String, Object> variables);
}
