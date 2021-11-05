import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("links")
export class Link extends BaseEntity {
    @PrimaryGeneratedColumn({
        comment: "unique identifier",
    })
    id: number;

    @Column({
        type: "text",
        nullable: false,
        unique: true,
    })
    code: string;

    @Column({
        type: "integer",
    })
    board_id: number;

    @Column({
        type: "text",
        default: "",
    })
    to: string;
}
