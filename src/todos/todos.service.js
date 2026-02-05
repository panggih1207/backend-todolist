import { request, response } from "express";

export const getTodos = async (req = request , res = response) => {
    try {
        const data = await prisma.todos.findMany();
        return res.status(200).json({
            message : 'get Data Succes' ,data
        })
    } catch (error) {
        return res.status(500).json({
            message :error.message
        })
       
        
    }
   
}

 export const deletedTodos= async (req = request ,res = response) => {
    try {
        const {id} = await req.params;
        if (!id) {return res.status(401).json({
            message :"id is not defined"
        });
       
            
        }
         const deletedData = await prisma.todos.delete({
            where : {
                id : id 
            }
         });

         return res.status(200).json({
            message :" get deleted succes" , deletedData
         })


    } catch (error) {
        return res.status(500).json({
            message : error.message
        })
        
    }
    
 }