const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 配置参数
const INPUT_DIR = '../data/pdf_file'; // 输入目录
const OUTPUT_DIR = '../data/pdf_img'; // 输出目录
const DPI = 400; // 分辨率
const PDF_TO_PPM_CMD = `pdftoppm -png -rx {dpi} -ry ${DPI} {input} {output}`;

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 查找所有 PDF 文件
function findPDFFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    
    if (stat && stat.isDirectory()) {
      // 递归查找子目录
      results = results.concat(findPDFFiles(file));
    } else if (path.extname(file).toLowerCase() === '.pdf') {
      results.push(file);
    }
  });
  
  return results;
}

// 转换单个 PDF 文件
function convertPDFToPNG(pdfPath) {
  return new Promise((resolve, reject) => {
    // 生成输出文件名（不带扩展名）
    const relativePath = path.relative(INPUT_DIR, pdfPath);
    const outputBase = path.join(OUTPUT_DIR, relativePath.replace(/\.pdf$/i, ''));
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputBase);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 构建命令
    const command = PDF_TO_PPM_CMD
      .replace('{dpi}', DPI)
      .replace('{dpi}', DPI)
      .replace('{input}', pdfPath)
      .replace('{output}', outputBase);
    
    console.log(`正在转换: ${pdfPath}`);
    console.log(`执行命令: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`转换失败: ${pdfPath}`);
        console.error(stderr);
        reject(error);
      } else {
        console.log(`转换成功: ${pdfPath}`);
        resolve();
      }
    });
  });
}

// 主函数
async function main() {
  try {
    const pdfFiles = findPDFFiles(INPUT_DIR);
    
    if (pdfFiles.length === 0) {
      console.log(`在目录 ${INPUT_DIR} 中未找到 PDF 文件`);
      return;
    }
    
    console.log(`找到 ${pdfFiles.length} 个 PDF 文件，开始转换...`);
    
    // 依次转换所有 PDF 文件
    for (const pdfFile of pdfFiles) {
      try {
        await convertPDFToPNG(pdfFile);
      } catch (err) {
        console.error(`处理文件 ${pdfFile} 时出错:`, err);
      }
    }
    
    console.log('所有文件转换完成！');
  } catch (err) {
    console.error('发生错误:', err);
  }
}

// 启动转换
main();