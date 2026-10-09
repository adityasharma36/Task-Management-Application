
import type { Prisma } from "../generated/prisma/client.ts";
import prisma from "../prisma/client.ts";





export default class UserRepository{

        async findByEmail(email:string){
            const response = await prisma.user.findUnique({
                where:{
                    email: email
                }
            })
            return response;
        }

        async findById(id:string){
            const response = await prisma.user.findUnique({
                where:{
                    id: id
                },
                include:{
                    tasks: true
                }
            })
            return response;
        }

        async createUser(data:Prisma.UserCreateInput){
            const response = await prisma.user.create({
               data
            })
            return response;
        }

        async updateUser(id:string,data:Prisma.UserUpdateInput){
            const response = await prisma.user.update({
                where:{
                    id
                },
                data
            })
            return response
        }

        async deleteUser(id:string){
            return await prisma.user.delete({
                where:{
                    id
                }
            })
        }
}