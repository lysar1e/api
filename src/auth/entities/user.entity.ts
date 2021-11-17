import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User extends BaseEntity {
    @PrimaryGeneratedColumn({
        comment: "unique identifier",
    })
    id: number;

    @Column({
        type: "text",
        nullable: false,
        unique: true,
    })
    email: string;

    @Column({
        type: "text",
        nullable: false,
    })
    password: string;

    @Column({
        type: "text",
        nullable: false,
        default: "user"
    })
    role: string;

    @Column({
        type: "boolean",
        nullable: false,
        default: false
    })
    sub: boolean;
}
