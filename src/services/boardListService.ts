import Background from "@/assets/images/background-card-image.png"
import Member from "@/assets/images/member.png"

export function getBoardList() {
    try {
        // const response = await fetch(process.env.BACKEND_URL + "/auth/login" || "http://localhost:5000/auth/login",
        //     {
        //         method: "GET",
        //         headers: {
        //             "Authentication": "Bearer "
        //         }
        //     }
        // )
        // const data = await response.json()
        // console.log(data)
        // return data
        return [
            {
                "id": 1,
                "name": "Tablero 1",
                "description": "Descripción 1 de prueba mas larga",
                "image": Background,
                "creationDate": "19-7-2025",
                "userId": 1,
                "members": [{"image": Member}, {"image": Member},  {"image": Member}, {"image": Member},  {"image": Member},  {"image": Member},  {"image": Member}],
                "isPublic": false
            },
            {
                "id": 2,
                "name": "Tablero 2",
                "description": "Prueba de descripcion larga",
                "image": Background,
                "creationDate": "19-7-2025",
                "userId": 2,
                "members": [{"image": Member}, {"image": Member}, {"image": Member}],       
                "isPublic": false
            },
            {
                "id": 3,
                "name": "Tablero 3",
                "description": "Descripción 3",
                "image": Background,
                "creationDate": "19-7-2025",
                "userId": 3,
                "members": [{"image": Member}, {"image": Member}, {"image": Member}],
                "isPublic": false
            }
        ]
    } catch (error) {
        console.log("Error de conexión:", error);
        return error
    }
}