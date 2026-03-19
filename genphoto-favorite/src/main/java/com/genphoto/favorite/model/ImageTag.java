package com.genphoto.favorite.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "image_tags", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"image_id", "tag_id"})
})
public class ImageTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_id", nullable = false)
    private Long imageId;

    @Column(name = "tag_id", nullable = false)
    private Long tagId;
}
