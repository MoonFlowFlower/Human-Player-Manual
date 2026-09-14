import type { Chapter, Direction, LearningRelation, Source } from './types.js';

// Dates record this edition's source consultation, not clinical peer review.
export const foundationSources: Source[] = [
 {id:'sleep-hours',publisher:'NIH / NHLBI（美国）',title:'How Much Sleep Is Enough?',url:'https://www.nhlbi.nih.gov/health/sleep/how-much-sleep',scope:'一般成年人睡眠时长参考；儿童、疾病恢复期等情况不能直接套用。',checked:'2026-09-14'},
 {id:'sleep-daytime',publisher:'NIH / NHLBI（美国）',title:'Sleep Deprivation and Deficiency — How Sleep Affects Your Health',url:'https://www.nhlbi.nih.gov/health/sleep-deprivation/health-effects',scope:'睡眠不足与日间困倦、注意及反应的关系；不是个人诊断工具。',checked:'2026-09-14'},
 {id:'sleep-habits',publisher:'NHS（英国）',title:'Insomnia',url:'https://www.nhs.uk/conditions/insomnia/',scope:'睡眠习惯建议和寻求评估的情形；页面中的 GP、就诊途径适用于英国。',checked:'2026-09-14'},
 {id:'sleep-breathing',publisher:'NHS（英国）',title:'Sleep apnoea',url:'https://www.nhs.uk/conditions/sleep-apnoea/',scope:'睡眠呼吸暂停的警示症状与就医建议；不能凭本章自行确诊。',checked:'2026-09-14'},
 {id:'food-pattern',publisher:'Health Canada（加拿大）',title:'Healthy eating recommendations',url:'https://www.canada.ca/en/health-canada/services/food-guide/explore/healthy-eating-recommendations.html',scope:'加拿大公共饮食建议：多样食物、饮水与饮食环境；不提供个人热量或治疗性饮食方案。',checked:'2026-09-14'},
 {id:'food-variety',publisher:'Health Canada（加拿大）',title:'Eat a variety of healthy foods each day',url:'https://www.canada.ca/en/health-canada/services/food-guide/explore/healthy-eating-recommendations/eat-variety.html',scope:'食物种类、日常饮食模式以及预算、文化和个人需要。',checked:'2026-09-14'},
 {id:'movement',publisher:'世界卫生组织',title:'Physical activity',url:'https://www.who.int/news-room/fact-sheets/detail/physical-activity',scope:'活动包括日常移动，不限于健身；不同健康状态需采用适合的活动方式。',checked:'2026-09-14'},
 {id:'study-guide',publisher:'美国教育科学研究所 IES / WWC',title:'Organizing Instruction and Study to Improve Student Learning',url:'https://ies.ed.gov/ncee/wwc/PracticeGuide/1',scope:'2007 年教育实践指南，覆盖学校至高等教育。支持例题与独立练习交替、间隔学习、主动回忆；不同建议证据强度不同，不能保证所有技能同样受益。',checked:'2026-09-14'},
 {id:'retrieval-study',publisher:'Roediger & Karpicke / Psychological Science',title:'Test-enhanced learning: taking memory tests improves long-term retention（2006）',url:'https://pubmed.ncbi.nlm.nih.gov/16507066/',scope:'学生学习短文的实验：短时表现和延迟回忆可能不同；不是对职业技能或个人记忆能力的全面测量。',checked:'2026-09-14'},
 {id:'spacing-study',publisher:'Karpicke & Roediger / Journal of Experimental Psychology',title:'Expanding retrieval practice promotes short-term retention, but equally spaced retrieval enhances long-term retention（2007）',url:'https://pubmed.ncbi.nlm.nih.gov/17576148/',scope:'回忆间隔与测量时间的实验；不支持一张适合所有人的固定复习日历。',checked:'2026-09-14'},
 {id:'switching-study',publisher:'Rubinstein, Meyer & Evans / Journal of Experimental Psychology',title:'Executive control of cognitive processes in task switching（2001）',url:'https://pubmed.ncbi.nlm.nih.gov/11518143/',scope:'分类与算术任务切换的实验，观察到切换时间成本；不能直接换算为日常工作效率百分比。',checked:'2026-09-14'},
 {id:'source-check',publisher:'Digital Inquiry Group / Civic Online Reasoning',title:'COR Classroom Posters',url:'https://cor.inquirygroup.org/curriculum/collections/cor-classroom-posters/',scope:'查看信息发布者、证据与其他来源的教学方法；网页公开说明可读，部分教学材料需要账户。',checked:'2026-09-14'},
 {id:'memory-care',publisher:'NHS（英国）',title:'Memory loss (amnesia)',url:'https://www.nhs.uk/symptoms/memory-loss-amnesia/',scope:'持续或影响日常生活的记忆问题应寻求医疗评估，不自行诊断；英国就诊渠道不直接适用于其他地区。',checked:'2026-09-14'},
 {id:'help-visit',publisher:'NHS（英国）',title:'What to ask your doctor',url:'https://www.nhs.uk/nhs-services/gps/what-to-ask-your-doctor/',scope:'预约前准备问题、确认解释和下一步；医疗服务安排适用于英国。通用求助示例由本手册编写。',checked:'2026-09-14'}
];

export const chapters: Chapter[] = [
 {id:'sleep',title:'怎样判断自己有没有休息够？',shortTitle:'睡眠与休息',direction:'care',summary:'分清没睡够、睡得不安稳和白天持续困倦，知道先调整什么、何时求助。',aliases:['睡不醒','睡不好','休息不够','睡眠','总是困','早起','熬夜','白天犯困'],
 lead:'明明在床上待了很久，白天还是困。先别急着把它归结为不自律：睡眠时间、睡眠是否连续，以及醒来后能不能正常做事，是不同的问题。',
 sections:[
  {title:'先看三个方面，不只盯着一个数字',paragraphs:['有没有留出足够的睡眠时间？一般成年人可以把每晚 7—9 小时作为参考，但它不是及格线。有人在补觉或生病恢复时需要更多；在床上躺八小时，也不等于睡了八小时。','睡得是否安稳？可以留意入睡是否困难、夜里是否反复醒来。白天呢？持续打瞌睡、难以集中注意，或在本该清醒时睡着，都值得关注。单次疲倦不能说明原因，长期困倦也不一定只由睡眠引起。'],sources:['sleep-hours','sleep-daytime']},
  {title:'同样是“睡了八小时”，问题可能不同',example:true,paragraphs:['小林从午夜到早上八点躺在床上，但花了很久才睡着，夜里还醒了几次。他首先需要弄清的是实际睡眠被什么打断。','小周连续几天只给自己五小时睡觉，周末才补很久。对他而言，更早检查工作和生活安排能否留出睡眠时间，比寻找“高效睡眠技巧”更切中问题。这个例子用于区分情形，不用于诊断。']},
  {title:'今晚先改一个容易观察的条件',paragraphs:['在生活允许的范围内，让起床时间相对稳定，给睡前留一点安静收尾的时间；检查卧室的光线、噪声和舒适度。临睡前的咖啡、茶或酒精也值得留意，酒精不是可靠的助眠办法。','不用同时改变所有习惯。先选一个明显打断睡眠的条件，例如把床边会响的通知关掉，再看看接下来几晚和白天有没有变化。轮班、照护家人或住房环境带来的限制，需要一起考虑，不是靠意志就能消除。'],sources:['sleep-habits']},
  {title:'哪些情况不宜只靠自己调整',paragraphs:['如果睡眠困难持续影响日常生活，或白天经常非常困，应联系医疗专业人员评估。有人发现你睡觉时呼吸暂停，或你反复憋醒、喘气，也需要就医，而不是等记录够几天才行动。','就诊时可说明大致持续多久、影响哪些活动、有没有人观察到夜间异常。无需先购买设备或自行用药，也不必把病史填在这个网站。'],sources:['sleep-breathing','sleep-habits']}
 ],action:{title:'可选：记下一次睡眠情况',text:'只记大致入睡、起床时间，以及白天是否明显困倦。目的是方便回顾，不是给睡眠打分，也不能用几天的记录证明健康问题已经解决。'},caution:'已经困到可能打瞌睡时，不要驾驶或操作危险设备。持续明显困倦、反复憋醒或被观察到呼吸暂停，应寻求医疗评估。',sources:['sleep-hours','sleep-daytime','sleep-habits','sleep-breathing']},
 {id:'meals',title:'吃饭和活动，怎样安排得简单一些？',shortTitle:'吃饭与活动',direction:'care',summary:'先准备能重复的一顿饭和一种方便的活动，不必从复杂食谱或完整训练计划开始。',aliases:['饮食','吃饭','运动','活动','生活基础','不会做饭','没空运动'],
 lead:'忙了一天，最难的常常不是“不知道要健康”，而是不知道这一顿吃什么、今天还能怎么动一动。先减少临时做决定的次数，比一次排满理想生活更容易试起来。',
 sections:[
  {title:'先让日常组合多一点，不追求每餐完美',paragraphs:['公共饮食建议强调蔬菜水果、全谷物和蛋白质食物的多样组合，并把水作为日常饮品选择。看的是一段时间里的饮食模式，不是某一种食物有没有神奇功效。','口味、预算、能否做饭和食物是否买得到，都属于安排的一部分。下面是搭配思路，不是减重方案，也不是每个人都必须吃同样份量。'],sources:['food-pattern','food-variety']},
  {title:'给很忙的一天留一份备选',example:true,paragraphs:['例如，家里常备一种主食、一种自己能吃的蛋白质食物，再准备容易处理的蔬菜。忙时可以做“米饭＋豆腐或鸡蛋＋蔬菜”，也可以按自己的饮食习惯换成别的组合。','只会做两道菜也够开始。先问：这顿准备起来麻不麻烦？花费能否接受？吃完是否合适？不需要为了执行例子购买特定品牌、昂贵食材或补充剂。']},
  {title:'活动不只是在健身房训练',paragraphs:['步行、骑行、使用轮椅移动和家务中的身体活动，都在活动的范围内。比起完全不动，适合自己的少量活动也有价值；日常移动可以作为开始，而不是“没达到训练标准就不算”。','身体条件允许时，可以把一小段舒服的活动接在已有安排后面，例如办事途中多走一段，或在久坐之后起身活动。先选择安全、愿意重复的方式，再根据情况调整。'],sources:['movement']},
  {title:'卡住了，就改安排而不是加要求',paragraphs:['总是来不及做饭，可以先解决采购和准备；预算紧，先比较家里实际会吃完的食物，而不是只买看起来“最健康”的。活动经常中断，也可以换地点、换时间或缩小到容易开始的动作。','有食物过敏、疾病相关饮食要求、孕期或活动限制时，需要按个人情况咨询合适的专业人员。不要把这个普通生活示例替代已有的医疗建议。']}
 ],action:{title:'试着安排下一顿，而不是整个星期',text:'从已有的食物里想一顿准备起来不麻烦的饭；再找一个可以舒服活动的小空当。下次只检查最不方便的那一步，改掉它即可。'},caution:'不要尝试已知会引起过敏的食物。活动中出现明显不适时，应停止活动并寻求适当帮助；有健康方面的特殊要求时，按专业建议调整。',sources:['food-pattern','food-variety','movement']},
 {id:'attention',title:'事情很多时，先做哪一件？',shortTitle:'安排注意力',direction:'study',summary:'把后果、截止时间和能否推进分开看，找出现在具体能做的一步。',aliases:['注意力','拖延','事情太多','不知道先做什么','专注','分心','时间安排'],
 lead:'你打开了五个页面，每件事都做了一点，却没有一件真正往前走。先不要求自己更专注，先弄清楚：哪些事不能等，哪些事还缺条件，哪些事今天可以不做。',
 sections:[
  {title:'紧急、重要和容易做，不是一回事',paragraphs:['一条新消息会显得很急，但它的后果可能很小。整理桌面很容易完成，却不一定能解决下午要交的材料。排序时，先看延迟会造成什么损失、真实截止时间是什么，再看它是否影响其他事情。','下面是一种安排方法，不是对所有人的固定规则：先处理安全和不能错过的期限；再处理能让重要事情继续推进的步骤；把可以等待的事放在稍后，而不是始终摆在眼前。']},
  {title:'先排清楚，才能减少来回切换',paragraphs:['实验中，在不同分类规则或算术任务之间切换会花费额外时间。这并不能告诉你每天准确损失了多少效率，但提醒我们：不停切换不等于同时推进。','需要做一段相对完整的工作时，可以暂时收起不相关页面，把通知调成适合当前责任的状态。必须随时回应的岗位或照护任务不能照搬“完全断联”。'],sources:['switching-study']},
  {title:'“准备申请”太大，“查清缺哪份材料”就能动手',example:true,paragraphs:['假设明天下午要交申请，今晚想整理照片，还有一份表格不知道怎么填。与其从最容易的照片开始，可以先查清表格里不懂的一项，再决定是否需要向工作人员询问。','第一步不一定是埋头做完。打电话确认要求、给合作的人说明延迟、删掉不再需要的任务，都可能比继续堆待办更有效。']},
  {title:'先试一小段，再看卡在哪里',paragraphs:['给眼前这件事写一个可检查的结果，例如“找到申请的准确截止时间”，而不是“提高办事效率”。选一段自己能安排的时间，只做到这个结果。','结束时看的是：有没有推进？若没有，是太困、要求不清、材料缺失，还是这件事本就不值得继续？换掉阻碍，而不是一遍遍加长工作时间。持续影响生活的注意或情绪困难，也可以寻求专业支持，不靠这一章自行判断原因。']}
 ],action:{title:'从三件事里选出现在的一步',text:'不用填写表格。在纸上或心里列出眼前的三件事，问“哪件延迟会有实际后果？”再把选中的事缩成一个能看见结果的动作。'},sources:['switching-study']},
 {id:'practice',title:'看懂了，为什么还是不会？',shortTitle:'从看懂到会做',direction:'study',summary:'把跟着示范看、离开示范回忆和独立完成，分成可以练习的几个环节。',aliases:['学会学习','看懂不会','看懂了不会做','学习方法','练习','教程','怎么学习'],
 lead:'跟着教程时，每一步似乎都合理；关掉教程，却不知道第一步做什么。你可能已经能认出一个答案，但还没有练过自己把它找出来、用起来。',
 sections:[
  {title:'先弄清楚，你想“会”的是什么',paragraphs:['能认出一个词、能不用提示说出意思、能在新句子里用对它，是不同的目标。学习软件也是这样：看别人操作，与自己面对空白文件把事情做完，不是同一次练习。','先把目标写成动作，例如“关掉示范，独立做出同样的表格”，而不是“看完十集教程”。阅读和示范仍然有用，它们帮你建立第一份可参考的过程。']},
  {title:'给示范和独立尝试各留一点位置',paragraphs:['可以先看一个完整例子，理解为什么这样做；然后收起它，独立试一个相近问题；卡住后再对照，找出具体漏掉的一步。IES 的教学指南建议把例题讲解与独立解题交替安排，而不是只有其中一种。','反馈要能改变下一次行动。“不对”太宽泛，“你用了正确公式，但把分钟当成小时”就能指导重试。看完纠正后，再亲手做一次，检查自己是否真的改了那一步。'],sources:['study-guide']},
  {title:'同一个例子里，分清三种卡住',example:true,paragraphs:['假设你学会了给表格求平均值。收起教程后找不到命令，是操作步骤没记住；知道命令但选错范围，是条件判断出了问题；照着例子会做，换个表格就不确定，则需要练习识别新情境里哪些条件仍然相同。','这些问题的补法不同：不是每次都从头再看一遍，也不是看不懂时还硬撑着做。先找最具体的一处，再决定补解释、补步骤还是换一个例子。']},
  {title:'从相近问题开始，不急着证明什么都能做',paragraphs:['改变例子的一两个条件再试，比马上挑战完全陌生的项目更容易看出你究竟理解了什么。下面的小练习只练“离开原文回忆，再用到相近情境”，不测试所有学习能力。','危险设备、医疗操作等不能靠网页练习自行上手，需要合格指导和安全条件。若问题需要前面的知识，先补那一小块；不是把难度越拉越高才算认真学习。']}
 ],action:{title:'现在就试一次：收起原文，再回忆',text:'读一段简短的借伞说明，收起它，写下记住的内容，对照遗漏，再处理一个相近情境。内容是虚构示例，不需要个人资料。',practice:'recall'},sources:['study-guide','retrieval-study']},
 {id:'memory',title:'学过的东西，怎样记得更牢？',shortTitle:'回忆与复习',direction:'study',summary:'用主动回忆发现遗漏，把复习分散开，并根据实际记住的情况调整。',aliases:['看完记不住','记不住','记忆','复习','遗忘','背书','学完就忘'],
 lead:'一遍遍重看，内容越来越熟悉，但合上页面还是说不出来。复习时可以换一个问题：不是“我还认不认识它”，而是“没有提示时，我能想起哪些关键内容”。',
 sections:[
  {title:'回忆既能检查，也能帮助之后记住',paragraphs:['在学生学习短文的实验里，重复阅读的短时表现可能更好，但先做回忆练习的人在延迟测验中记得更多。熟悉感和以后能不能想起来，可能给出不同答案。','这不意味着“阅读无用”。没理解的内容先要读懂；回忆之后也要对照可靠答案，补上漏掉或记错的部分。这里讨论的是学习材料，不是对个人记忆健康作判断。'],sources:['retrieval-study']},
  {title:'隔一段时间再试，而不是一口气重看很多遍',paragraphs:['把学习分散在不同时间，是 IES 指南建议的方法之一。具体间隔要看材料难度、什么时候需要使用，以及你还能回忆起多少；没有一张对所有人都最好的时间表。','一种可调整的做法是：今天学完先回忆，隔天再试，之后隔更久再试。这里的“隔天”只是起步示例，不是研究证明的最优日程。完全想不起来就缩小材料、补看后重试；已经很稳，再适当拉开间隔。'],sources:['study-guide','spacing-study']},
  {title:'把“再读一遍”换成一个可以回答的问题',example:true,paragraphs:['刚读过一篇辨别网上信息的文章，可以先关掉它，问自己：“我会先查谁发布的？证据来自哪里？哪些转发其实用了同一个来源？”','对照原文后，若只漏了“多个转发不等于多个独立证据”，下次重点回忆这一点，并找一个新例子，而不是机械抄写整篇。']},
  {title:'检查结果，不用记忆给自己下结论',paragraphs:['一时想不起来，只说明这次、这份材料还需要支持，不等于你不适合学习。材料太多、没理解或休息不足，都值得分别检查。','网页练习完成，只表示做过这次回忆和应用。过一段时间再试，才能知道保留了多少；现实技能还需要现实任务里的反馈。记忆问题持续出现或明显影响日常生活时，应寻求医疗评估，而不是靠加大背诵量解决。'],sources:['memory-care']}
 ],action:{title:'用一小段材料试一次回忆',text:'可以继续借伞练习，也可以挑刚学过的一小段：收起内容，回忆关键点，对照后只补遗漏。',practice:'recall'},sources:['retrieval-study','study-guide','spacing-study','memory-care']},
 {id:'claims',title:'网上的一条说法，值不值得相信？',shortTitle:'判断信息',direction:'study',summary:'追到原始证据，检查适用条件，不把转发数量和肯定语气当成可靠程度。',aliases:['信息判断','真的假的','可信吗','查资料','网上说','谣言','信息可信','证据'],
 lead:'一张截图说“研究证明，这个方法让效果提高一半”。先不急着转发或照做。把问题拆成三件事：是谁在说、凭什么这样说、这个证据到底能说明到哪里。',
 sections:[
  {title:'先离开这条消息，看看发布者是谁',paragraphs:['陌生页面可以写得非常专业。先到页面之外查发布者、机构和原始资料，比只看页面是否精致更有用。Civic Online Reasoning 把这种到其他来源核对的做法称为横向阅读。','找到原始研究、官方通知或一手记录，再看日期、地区和讨论对象。两个网站可能都引用同一份新闻稿；这不是两份相互独立的证据。'],sources:['source-check']},
  {title:'“提高一半”，先问它测了什么',example:true,paragraphs:['假设某课程的广告说“记忆提高 50%”。这只是本章编写的示例。你需要知道：和谁比较？有多少人？测的是五分钟后回忆，还是几个月后实际使用？参加者是否本来就更有动力？','如果只有几位学员的好评，可以知道他们报告了好体验，但不能据此推出所有人都能得到相同效果。没有足够信息时，可以暂时不判断，而不是在“全信”和“全是假”之间二选一。']},
  {title:'结论的范围不要比证据更大',paragraphs:['实验支持某种条件下的效果，不等于适用于所有人。某地的制度说明，也不自动适用于你所在的地区。旧研究不一定过时，新文章也不一定更可靠，关键是问题本身是否已经变化。','对眼下影响很小的信息，不必无限查下去；涉及用药、重大支出、法律后果或安全时，值得查当前的一手资料，必要时向合适的专业人员确认。']},
  {title:'找不到证据时，也可以得到一个有用结果',paragraphs:['把“这个方法有用”改写为“这条消息没有给出足够证据，暂不据此行动”，已经缩小了误判风险。没有证据不自动证明它是假的，但你不必替发布者补出一份可靠性。','找到来源后，保留原链接和一句清楚的摘要：它实际支持什么，没说明什么。搜索框里出现相似结果，并不代表问题已经被回答。']}
 ],action:{title:'检查一条具体说法',text:'挑一条最近看到、但不涉及你私人资料的说法。找到最初来源，写出它支持的最窄结论；找不到就标为暂无法判断。不需要把链接或记录提交到这里。'},sources:['source-check']},
 {id:'help',title:'遇到自己处理不了的问题，怎样求助？',shortTitle:'把求助说清楚',direction:'care',summary:'说明发生了什么、卡在哪里和希望得到什么帮助，再确认下一步。',aliases:['求助','不知道怎么办','找人帮忙','压力','表达需求','问医生','办事'],
 lead:'“我不知道怎么办”是真的，但别人可能也不知道该从哪里帮。你不必先把原因全部弄懂；把当前问题和需要的帮助说清楚，往往就能开始。',
 sections:[
  {title:'先分清需要的是哪一种帮助',paragraphs:['是想有人听你说一会儿，还是需要一条准确信息、一个实际动作，或有资格的人作判断？可以直接说明，也可以请对方帮你一起弄清楚。','问熟悉流程的人，适合了解如何办理；涉及诊断、法律责任或其他高风险判断，应找对应地区合适的专业服务。一个热心人不一定拥有所需权限或专业能力。']},
  {title:'把模糊的请求变得可以回应',example:true,paragraphs:['“我办不了这个申请”可以具体成：“我需要在周五前交材料，现在不确定是否要原件。我看过通知但没找到说明，你能帮我确认负责咨询的部门吗？”','需要倾听时也可以说：“这件事让我很难受，我现在主要想说一说，暂时不用替我想办法。”对方忙或不适合帮忙时，可以再找别的渠道，不需要一次请求解决所有事。']},
  {title:'去见专业人员前，准备少量关键问题',paragraphs:['NHS 的就诊准备建议包括：提前写下最想问的几件事，说明问题何时出现、有什么变化；听不懂时请对方换一种说法。离开前确认下一步、预计什么时候有结果，以及情况变化时联系谁。','这是英国医疗服务的建议，具体预约方式请查所在地区。把“问题、影响、已经试过什么、需要确认什么”整理出来，也可以用在学校、工作或其他办事咨询中。不用在这个网站填写病史、住址或账户信息。'],sources:['help-visit']},
  {title:'没有得到回应，再换一条路径',paragraphs:['对方没有权限、暂时没空、你问的范围太大，都可能让求助停住。可以缩小到一个明确问题，确认另一个联系人，或换一个可靠的服务渠道。','如果对方要求提供敏感信息，先核实机构和用途，再通过正规渠道提交。压力或情绪困难持续影响生活时，也值得寻求专业支持，不必等到完全撑不住才问。']}
 ],action:{title:'准备一句可以发出去的求助',text:'试着说：“我遇到……，目前卡在……，希望你帮我确认／做……，大概需要在……之前。”不必填满每一项；只保留对方需要知道的内容。'},caution:'如果正在发生人身危险或医疗紧急情况，应联系当地紧急服务，或请身边的人协助；不要等完成阅读或练习再求助。',sources:['help-visit']}
];

export const directions: Direction[] = [
 {id:'care',number:'01',title:'照顾好自己',summary:'睡不好、忙得顾不上吃饭，或不知道何时需要帮助。',topics:'睡眠 · 饮食 · 活动 · 压力与安全',intro:'先让日常生活有个稳妥的基础。从眼下最影响你的问题开始；睡眠、吃饭和求助可以分别阅读。',readings:[{kind:'chapter',id:'sleep'},{kind:'chapter',id:'meals'},{kind:'chapter',id:'help'}],planned:['日常压力的应对','基本安全与应急']},
 {id:'study',number:'02',title:'学会学习和判断',summary:'事情多不知道先做什么，或看完、学过还是不会用。',topics:'注意力 · 练习 · 记忆 · 信息判断',intro:'先选好眼前的一步，再练习独立回忆、对照和应用。可以按下面的建议顺序读，也可以直接解决“看完记不住”等具体问题。',readings:[{kind:'chapter',id:'attention'},{kind:'chapter',id:'practice'},{kind:'chapter',id:'memory'},{kind:'chapter',id:'claims'}],planned:[]},
 {id:'living',number:'03',title:'独立安排生活',summary:'安排开支、住房和办事，处理数字安全与工作收入。',topics:'日常开支 · 住房 · 办事 · 数字安全',intro:'把生活里的固定支出、需要办理的事和风险分开看。目前可以先读价格怎样形成，以及把办事求助说清楚；完整的生活安排章节还在整理。',readings:[{kind:'chapter',id:'help'},{kind:'concept',id:'prices'}],planned:['日常开支与预算','住房与常见手续','数字安全','工作与基本收入']},
 {id:'people',number:'04',title:'与人相处和合作',summary:'表达自己的需要，听懂别人，协商分歧与共同做事。',topics:'表达 · 倾听 · 边界 · 信任',intro:'既要把自己的需要说清楚，也要知道对方能做什么。现在可以从一段具体的求助表达开始；倾听、边界和合作会分别展开。',readings:[{kind:'chapter',id:'help'},{kind:'concept',id:'work'}],planned:['倾听与表达','边界与分歧','信任与合作']},
 {id:'world',number:'05',title:'看懂世界怎样运转',summary:'一件东西从哪里来、为什么这个价，背后哪些环节相互影响。',topics:'生产与物流 · 市场 · 能源 · 信息',intro:'从一个具体事物，看它依赖什么，又会影响什么。已有的面包、物流和价格内容都在这里；知识地图用来查看这些联系。',readings:[{kind:'concept',id:'food'},{kind:'concept',id:'transport'},{kind:'concept',id:'prices'},{kind:'concept',id:'information'},{kind:'concept',id:'energy'}],planned:['企业与政府','法律与制度','科学方法','互联网']},
 {id:'choices',number:'06',title:'做选择，建设自己的生活',summary:'弄清自己需要什么，比较选择，用小尝试了解风险与长期影响。',topics:'需要 · 选择 · 职业尝试 · 长期影响',intro:'选择的终点可以不同。先从如何安排眼前的事、检查一条关键说法读起，再逐渐扩展到职业和项目的比较与尝试。',readings:[{kind:'chapter',id:'attention'},{kind:'chapter',id:'claims'}],planned:['认识自己的需要','比较选择与风险','尝试职业和项目','长期影响']}
];

// Stable prefixed references let learning views and the world atlas share content.
export const learningRelations: LearningRelation[] = [
 {from:'chapter:attention',to:'chapter:practice',type:'recommended',reason:'选好一件要学的事，再试着独立完成。'},
 {from:'chapter:practice',to:'chapter:memory',type:'recommended',reason:'练过一次之后，看看怎样安排后续复习。'},
 {from:'chapter:memory',to:'chapter:claims',type:'recommended',reason:'需要记住的内容，也值得先检查是否可靠。'},
 {from:'chapter:sleep',to:'chapter:attention',type:'related',reason:'白天困倦时，安排任务也要考虑休息。'},
 {from:'chapter:meals',to:'concept:food',type:'related',reason:'从安排一顿饭，继续了解食物从哪里来。'},
 {from:'chapter:meals',to:'concept:prices',type:'related',reason:'采购预算会遇到价格的变化。'},
 {from:'chapter:claims',to:'concept:information',type:'related',reason:'检查一条消息，也是在检查信息怎样传递。'},
 {from:'chapter:help',to:'concept:work',type:'related',reason:'共同做事时，需要知道谁负责什么。'}
];

export const recallExample = [
 '借伞时，在借用单上记下伞的编号。',
 '当天闭馆前，把伞还到入口处。',
 '发现伞损坏时，交给服务台，不直接放回伞架。'
];
export const transferOptions = [
 {id:'rack',text:'闭馆前放回入口伞架，在借用单上注明损坏。',feedback:'你记住了归还时间，也想留下说明，但漏了损坏时的处理方式：应交给服务台，避免其他人再次借走损坏的伞。'},
 {id:'desk',text:'闭馆前把伞交给服务台，说明哪个编号的伞损坏了。',feedback:'你把归还时间、伞的编号和损坏时的处理方式放到了一起。这个相近情境里，需要优先使用“损坏交服务台”的条件。'},
 {id:'tomorrow',text:'先带回去尝试修好，第二天开馆再交给服务台。',feedback:'你考虑了损坏问题，但自行延迟归还不在说明里。按给定规则，应在当天闭馆前交给服务台，而不是自己改变归还时间。'}
];
