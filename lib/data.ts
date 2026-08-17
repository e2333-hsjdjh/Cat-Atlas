import type { Campaign, Cat, TimelineItem } from "./types";

export const cats: Cat[] = [
  {id:"10000000-0000-4000-8000-000000000001",slug:"baishoutao",name:"白手套",aliases:[],sex:"公猫",age:"2023 年已收录",coat:"狸花白胸",feature:"白胸口和四只白爪，圆眼睛",area:"校园内",temperament:"粘人、亲人、活泼",status:"official",health:"待更新",neutered:null,intro:"人气很高的活泼小狸花，最大的辨认特点是胸前与爪子的白色花纹。",image:"/cats/baishoutao.jpg",imagePosition:"center",sightings:36},
  {id:"10000000-0000-4000-8000-000000000002",slug:"haidao",name:"海盗",aliases:[],sex:"公猫",age:"2023 年已收录",coat:"黑白奶牛",feature:"半边黑脸，鼻下有黑色小胡子",area:"校园内",temperament:"胆小、温顺",status:"official",health:"待更新",neutered:null,intro:"长着极有辨识度的黑白脸谱，虽然看起来很威风，其实性格胆小又温顺。",image:"/cats/haidao.jpg",imagePosition:"center",sightings:42},
  {id:"10000000-0000-4000-8000-000000000003",slug:"shatangju",name:"沙糖橘",aliases:[],sex:"母猫",age:"2023 年已收录",coat:"浅橘白",feature:"浅橘色头顶与尾巴，身体大面积白色",area:"校园内",temperament:"特别温顺、很乖、粘人",status:"official",health:"待更新",neutered:null,intro:"性格特别温顺，很乖也很粘人，是图鉴里写着“任人摸摸”的小姑娘。",image:"/cats/shatangju.jpg",imagePosition:"center",sightings:51},
  {id:"10000000-0000-4000-8000-000000000004",slug:"hongtang",name:"红糖",aliases:[],sex:"未知",age:"2023 年已收录",coat:"狸花",feature:"蓝绿色眼睛，额头有清晰虎斑",area:"校园内",temperament:"亲人、温顺、喜欢贴贴",status:"official",health:"待更新",neutered:null,intro:"见人就蹭，喜欢一边贴贴一边喵喵，是很会表达亲近的猫咪。",image:"/cats/hongtang.jpg",imagePosition:"center",sightings:47},
  {id:"10000000-0000-4000-8000-000000000005",slug:"xiaolihua",name:"小李华",aliases:["狸妹"],sex:"母猫",age:"2023 年已收录",coat:"深色狸花",feature:"深色虎斑，体型圆润",area:"校园内",temperament:"胆小怕生，熟悉后很粘人",status:"official",health:"待更新",neutered:null,intro:"刚认识时胆小怕生，熟悉后非常粘人，也是聪敏的爬树大王和不挑食的好孩子。",image:"/cats/xiaolihua.jpg",imagePosition:"center",sightings:33},
  {id:"10000000-0000-4000-8000-000000000006",slug:"huahua",name:"花花",aliases:[],sex:"母猫",age:"2023 年已收录",coat:"三花",feature:"头顶橘黑拼色，身体大面积白色",area:"校园内",temperament:"温顺、胆小、貌美",status:"official",health:"待更新",neutered:null,intro:"安静温顺的小三花，胆子不大，图鉴给她的关键词是“貌美”。",image:"/cats/huahua.jpg",imagePosition:"center",sightings:29},
  {id:"10000000-0000-4000-8000-000000000007",slug:"daju",name:"大橘",aliases:[],sex:"公猫",age:"2023 年已收录",coat:"橘色虎斑",feature:"通体橘色，体型修长",area:"校园内",temperament:"胆小怕人",status:"official",health:"待更新",neutered:null,intro:"被大家称作“腼腆的美男咪”，请远远观察，不要围堵或追逐。",image:"/cats/daju.jpg",imagePosition:"center",sightings:38},
  {id:"10000000-0000-4000-8000-000000000008",slug:"xiaoju",name:"小橘",aliases:[],sex:"未知",age:"2023 年已收录",coat:"橘色虎斑",feature:"圆脸、琥珀色眼睛",area:"校园内",temperament:"胆小、爱喵喵",status:"pending",health:"近况待确认",neutered:null,intro:"2023 图鉴中的小橘，近期资料仍待大家补充和确认。",image:"/cats/xiaoju.jpg",imagePosition:"center",sightings:16},
  {id:"10000000-0000-4000-8000-000000000009",slug:"baga",name:"八嘎",aliases:[],sex:"未知",age:"2023 年已收录",coat:"黑白狸花",feature:"鼻头两侧深色花纹不对称",area:"校园内",temperament:"超级温顺，偶尔高冷",status:"official",health:"待更新",neutered:null,intro:"宇宙超级无敌温顺，怎么摸都不反抗，但也会偶尔保持一点高冷。",image:"/cats/baga.jpg",imagePosition:"center",sightings:65},
  {id:"10000000-0000-4000-8000-000000000010",slug:"bagong",name:"八公",aliases:[],sex:"公猫",age:"2023 年已收录",coat:"橘白",feature:"橘色头顶与背部，白色胸腹",area:"校园内",temperament:"偏外向、喜欢无差别亲人",status:"adopted",health:"已被领养",neutered:null,intro:"性格偏外向，喜欢无差别亲人，和小狸花是好朋友。现在已经被领养。",image:"/cats/bagong.jpg",imagePosition:"center",sightings:58},
];

export const timeline: TimelineItem[] = [
  {id:"t1",catSlug:"baga",type:"故事",title:"最爱学习的修远楼长",body:"八嘎以温顺出名，怎么摸都不反抗，也总爱在教学楼附近出现。",date:"2023-11-18",area:"校园内",author:"人人江南爱猫协会",featured:true},
  {id:"t2",catSlug:"bagong",type:"近况",title:"八公已被领养",body:"八公已经进入家庭生活。旧档案继续保留，记录它曾经与校园相伴的日子。",date:"2023-12-01",area:"已进入家庭",author:"人人江南爱猫协会"},
  {id:"t3",catSlug:"haidao",type:"故事",title:"啥都吃！咪以食为天",body:"请按工作人员建议科学投喂，不随意喂食人类食品，也不要重复加餐。",date:"2023-10-12",area:"校园内",author:"2023 猫咪图鉴",featured:true},
  {id:"t4",catSlug:"xiaolihua",type:"故事",title:"聪敏的爬树大王",body:"胆小怕生，但熟悉以后非常粘人，是不挑食的好孩子。",date:"2023-10-06",area:"校园内",author:"2023 猫咪图鉴"},
];

export const campaigns: Campaign[] = [
  {id:"20000000-0000-4000-8000-000000000001",title:"征集：补全 2023 图鉴猫咪近况",summary:"如果你最近遇见白手套、海盗、沙糖橘或其他老朋友，欢迎提交照片与大致时间。",deadline:"2026-09-15",submissions:28,status:"open"},
  {id:"20000000-0000-4000-8000-000000000002",title:"征集：新猫建档线索",summary:"发现图鉴里没有的猫咪？提交花色、显著特征和照片，帮助工作人员查重建档。",deadline:"长期有效",submissions:7,status:"open"},
];

export function getCat(slug:string){return cats.find(cat=>cat.slug===slug)}
export function getCatTimeline(slug:string){return timeline.filter(item=>item.catSlug===slug)}
