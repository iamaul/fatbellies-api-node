export interface CreateMealPlanDTO {
    fk_branch_id: string | null;
    name: string;
    day: string;
    max_capacity: number;
    price: number;
    startTime: Date;
    endTime: Date;
}