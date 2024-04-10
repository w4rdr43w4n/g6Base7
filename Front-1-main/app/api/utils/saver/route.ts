import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";

async function handler(req: Request) {
  const session = await getServerSession(options);
  if(!session){
    return Response.json({message:'Log in first'},{status:200})
  }
  const {title,content,type,style,outline} = await req.json()
  if(!type || !title || !content || !style || !outline){
   // console.log(type);
    //console.log(title);
    //console.log(content);
    return Response.json({message:'Invalid parameters'},{status:400})
  }
  switch (type){
    case 'lr':
      const lrRec = await db.literature.create({
        data:{
          email:session.user?.email,
          username:session.user?.name,
          title:title,
          content:content,
          style:style,
        }
      })
      if(lrRec)return Response.json({ok:true},{status:200}) 
    case 'ar':
        const arRec = await db.article.create({
          data:{
            email:session.user?.email,
            username:session.user?.name,
            title:title,
            content:content,
            style:style,
            outline:outline,
          }
        })
    case 'out':
          const outRec = await db.outline.create({
            data:{
              email:session.user?.email,
              username:session.user?.name,
              title:title,
              content:content,
            }
          })
        if(outRec)return Response.json({ok:true},{status:200})
    case 'ref':
          const refRec = await db.reflist.create({
            data:{
              email:session.user?.email,
              username:session.user?.name,
              style:style,
              list:content,
            }
          })
        if(refRec)return Response.json({ok:true},{status:200})
      break  
    default:
    return Response.json({message:'Invalid request'},{status:300})
    }
}


export {handler as POST, handler as GET };
