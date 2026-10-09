
import {z} from "zod";

 export const pingSchema = z.object({
    name:z.string(),
    age:z.number()
})