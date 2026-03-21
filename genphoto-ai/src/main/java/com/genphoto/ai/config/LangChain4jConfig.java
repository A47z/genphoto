package com.genphoto.ai.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LangChain4jConfig {

    @Value("${genphoto.ai.text-llm.base-url}")
    private String baseUrl;

    @Value("${genphoto.ai.text-llm.api-key}")
    private String apiKey;

    @Value("${genphoto.ai.text-llm.model}")
    private String model;

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return OpenAiChatModel.builder()
                .baseUrl(baseUrl)
                .apiKey(apiKey)
                .modelName(model)
                .temperature(0.8)
                .timeout(java.time.Duration.ofSeconds(60))
                .build();
    }
}
