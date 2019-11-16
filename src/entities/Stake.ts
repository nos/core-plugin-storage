import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Stake extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column("varchar", { length: 64 })
    public stakeKey: string;

    @Column("varchar", {
        length: 34,
    })
    public address: string;

    @Column("int")
    public redeemableTimestamp: number;
}
