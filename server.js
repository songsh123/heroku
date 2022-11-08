const express = require('express');
const cors = require('cors');
const app = express();
const  models = require('./models')
const multer = require('multer')
const upload = multer({
    storage: multer.diskStorage({
        destination : function (req,file,cb) {
            cb(null,'uploads/')
        },
        filename:function (req,file,cb) {
            cb(null,file.originalname  )
        }
    })
})
const port = 3000;

app.use(express.json());
app.use(cors());
app.use('/uploads',express.static('uploads'))

app.get('/banners',(req,res)=>{
    models.Banner.findAll({
        limit :2
    }).then((result)=>{
        res.send({
            banners: result
        })
    }).catch((err)=>{
        console.error(err)
        res.status(500).send('에러가 발생했습니다.');
    })
})

//res응답  req 요청
app.get("/products", (req, res) => {
    const query = req.query;
    console.log("QUERY : ", query);
    models.Product.findAll({
        order:[['createdAt','DESC']], //생성일자 내림 차순
        attributes:["id","name","description","price","createdAt","seller","imgeUrl","soldout"]   //attributes = 필요한 정보만 뽑아오는것
    }).then((result) => {
            console.log("PRODUCTS : ", result);
            res.send({
                products: result,
            });
        }).catch((error) => {
            console.error(error);
            res.send("에러 발생");
        });
});
app.post("/products", (req, res) => {
    const body = req.body;
    res.send({
        body,
    });
    const { name, description, price, seller } = body;
    if (!name || !description || !price || !seller) {
        res.send("모든 필드를 입력해주세요");
    }
    models.Product.create({
        name,
        description,
        price,
        seller,
    })
        .then((result) => {
            console.log("상품 생성 결과 : ", result);
            res.send({
                result,
            });
        })
        .catch((error) => {
            console.error(error);
            res.send("상품 업로드에 문제가 발생했습니다");
        });
});

app.get("/products/:id", (req, res) => {
    const params = req.params;
    const { id } = params;
    models.Product.findOne({
        where:{
            id : id
        }
    }).then((result)=>{
        console.log("PRODUCTS :",result)
        res.send({
            products:result
        })
    }).catch((err)=>{
        console.error(err)
        res.send("상품 조회에 에러가 발생했습니다.")
    })
});

app.post("/image",upload.single('image'),(req,res)=>{
    const file = req.file;
    console.log(file);
    res.send({
        imageUrl:file.path,
    })
})

app.post("/purchase/:id",(req,res)=>{
    const {id} = req.params;
    models.Product.update({
        soldout:1,
    },{
        where:{
            id:id
        },
      }).then((result)=>{
        res.send({
            result:true,
        });
    }).catch((err)=>{
        console.error(err);
        res.status(500).send('에러가 발생했습니다.');
    });
});

app.listen(port, () => {
    console.log("그랩의 쇼핑몰 서버가 돌아가고 있습니다");
    models.sequelize
        .sync()
        .then(() => {
            console.log("DB 연결 성공!");
        })
        .catch((err) => {
            console.error(err);
            console.log("DB 연결 에러ㅠ");
            process.exit();
        });
});