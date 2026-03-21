package com.genphoto.prompt.service;

import com.genphoto.common.exception.BusinessException;
import com.genphoto.prompt.model.PromptTemplate;
import com.genphoto.prompt.repository.PromptTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PromptTemplateService {

    private final PromptTemplateRepository templateRepository;

    /**
     * 获取模板列表（可按分类筛选）
     */
    public Page<PromptTemplate> getTemplates(String category, int page, int size) {
        if (category != null && !category.isEmpty()) {
            return templateRepository.findByCategoryOrderByCreatedAtDesc(category, PageRequest.of(page, size));
        }
        return templateRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    /**
     * 获取模板详情
     */
    public PromptTemplate getTemplate(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new BusinessException("模板不存在"));
    }

    /**
     * 创建模板
     */
    public PromptTemplate createTemplate(Long userId, String name, String templateText, String category) {
        PromptTemplate template = new PromptTemplate();
        template.setUserId(userId);
        template.setName(name);
        template.setTemplateText(templateText);
        template.setCategory(category);
        return templateRepository.save(template);
    }

    /**
     * 渲染模板 - 将变量替换到模板中
     * 例如模板："一只{颜色}的{动物}在{场景}中"
     * 变量：{颜色=红色, 动物=猫, 场景=花园}
     * 结果："一只红色的猫在花园中"
     */
    public String renderTemplate(Long templateId, Map<String, String> variables) {
        PromptTemplate template = getTemplate(templateId);
        String result = template.getTemplateText();
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            result = result.replace("{" + entry.getKey() + "}", entry.getValue());
        }
        return result;
    }

    /**
     * 删除模板
     */
    public void deleteTemplate(Long templateId, Long userId) {
        PromptTemplate template = getTemplate(templateId);
        if (!template.getUserId().equals(userId)) {
            throw new BusinessException("无权删除此模板");
        }
        templateRepository.delete(template);
    }
}
