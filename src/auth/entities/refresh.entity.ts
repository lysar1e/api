import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("refresh")
export class Refresh extends BaseEntity {
    @PrimaryGeneratedColumn({
        comment: "unique identifier",
    })
    id: number;

    @Column({
        type: "integer",
        nullable: false,
    })
    user_id: number;

    @Column({
        type: "text",
        nullable: false,
    })
    refresh_token: string;

    @Column({
        type: "text",
        default: 0,
    })
    refresh_exp: string;
}
