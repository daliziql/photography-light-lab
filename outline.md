# 这破相机真难用

交付：可离线运行的单文件 index.html，面向初学者的数字静态摄影课程。

主线：公园里骑车的人。场景光 → 光圈控制光束 → 快门累计时间 → 传感器记录 → ISO 信号处理 → 照片。

学习顺序：整体地图 → 光圈与景深 → 快门与运动 → ISO 与收光量 → 档位补偿 → 综合相机 → 练习与实拍。

每章先让控件改变画面，再提出观察问题、解释术语和公式，最后给判断方法。核心是连续改变光束、景深、时间积分、传感器样本和最终图像，不能只切换文字。

## 教学方法映射

已查阅 Ciechanowski 的完整 Archives 列表及 Simon 的 Game Art Tricks 索引；本主题选读：
- https://ciechanow.ski/cameras-and-lenses/ ：对应系统地图、光圈与光线汇聚、传感器记录的单变量实验。仅参考教学结构，图形与文字原创。
- https://simonschreibt.de/gat/renderhell/ ：对应从输入到输出的分阶段解释与失败诊断，不把渲染知识混入摄影主线。

## 知识依据

- Sony，Aperture (F-number) and A-Mode：https://www.sony.co.uk/electronics/support/articles/00267926
- Nikon，Understanding Maximum Aperture：https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-maximum-aperture
- Nikon，Understanding Shutter Speed：https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-shutter-speed
- Emil Martinec，Noise, Dynamic Range and Bit Depth in Digital SLRs：https://www.photonstophotos.net/Emil%20Martinec/noise.html
- Photons to Photos，Input-referred Read Noise：https://photonstophotos.net/Charts/RN_e.htm

## 模型与边界

- f 数使用精确整档内部值，显示常见四舍五入刻度；快门使用常见标称值，整档少许取整差异明确说明。
- 光圈系数说明：区分焦距 f 与系数 N，用 D = f/N 计算入口瞳直径；新增与原滑块同步的孔径对照、计算过程和整档按钮。通过面积 A ∝ 1/N² 推导整档乘 √2，说明标称刻度的近似值以及 1/3 档的 2^(1/6) 比例。
- 景深：薄透镜，固定 36 mm 画幅横边，弥散圈阈值 0.03 mm；景深范围是观看条件约定，不是实际镜头测量。画面为原创程序插画，非实拍或机型模拟。
- 收光量与 L × t / N² 成正比；理想输出线性信号与收光量 × ISO 成正比。预览使用简化显示曲线与高光裁切。
- 噪声采用光子散粒噪声加固定读出噪声的简化模型；ISO 不增加收光量。明确真实机型存在双转换增益、不同读出噪声与处理。
- 快门预览使用静止背景和匀速主体的时间平均，手抖为独立示意；慢放展示不等于真实曝光秒数。
- 所有计分只验证题目指定的教学条件，不声称测光零点等于艺术上的正确曝光。

## 验收

- 光圈直径、景深范围、时间积分长度和噪声随对应变量真实改变。
- 等亮度补偿改变收光量或快门效果；保存 A/B 保留实际画面和参数。
- 练习可失败、可成功、有针对性反馈；按钮、键盘与触屏可用。
- 在 file:// 离线执行，桌面及 390 px 屏幕检查，脚本无运行错误。
