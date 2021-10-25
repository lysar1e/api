import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("boards")
export class Board extends BaseEntity {
    @PrimaryGeneratedColumn({
        comment: "unique identifier",
    })
    id: number;

    @Column({
        type: "integer",
        nullable: false,
    })
    owner: number;

    @Column({
        type: "text",
        nullable: false,
    })
    name: string;

    @Column({
        type: "jsonb",
        default: [],
        nullable: false,
    })
    contributors: number[];

    @Column({
        type: "text",
        default: "",
        nullable: false,
    })
    generatedLink: string;

    @Column({
        type: "jsonb",
        default: [],
        nullable: false,
    })
    todos: {id: string, text: string, completed: boolean; important: boolean}[];
}
