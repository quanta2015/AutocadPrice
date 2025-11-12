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

// 检查PDF对应的PNG文件是否已存在
function checkPNGExists(pdfPath) {
  // 生成输出文件名（不带扩展名）
  const relativePath = path.relative(INPUT_DIR, pdfPath);
  const outputBase = path.join(OUTPUT_DIR, relativePath.replace(/\.pdf$/i, ''));
  const outputDir = path.dirname(outputBase);
  const baseName = path.basename(outputBase);
  
  // 检查输出目录是否存在
  if (!fs.existsSync(outputDir)) {
    return false;
  }
  
  // 检查该目录下是否存在以基础名称开头的PNG文件
  try {
    const files = fs.readdirSync(outputDir);
    const pngExists = files.some(file => {
      return file.startsWith(baseName) && path.extname(file).toLowerCase() === '.png';
    });
    return pngExists;
  } catch (error) {
    // 如果读取目录出错，认为PNG不存在
    return false;
  }
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
      .replace(/{dpi}/g, DPI)  // 使用全局替换，修复重复替换问题
      .replace('{input}', `"${pdfPath}"`)  // 添加引号处理路径中的空格
      .replace('{output}', `"${outputBase}"`);  // 添加引号处理路径中的空格
    
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
    
    console.log(`找到 ${pdfFiles.length} 个 PDF 文件，开始检查并转换...`);
    
    let convertedCount = 0;
    let skippedCount = 0;
    
    // 依次处理所有 PDF 文件
    for (const pdfFile of pdfFiles) {
      try {
        // 检查PNG是否已存在
        if (checkPNGExists(pdfFile)) {
          console.log(`跳过已转换的PDF: ${pdfFile}`);
          skippedCount++;
          continue;
        }
        
        await convertPDFToPNG(pdfFile);
        convertedCount++;
      } catch (err) {
        console.error(`处理文件 ${pdfFile} 时出错:`, err);
      }
    }
    
    console.log(`转换完成！已转换: ${convertedCount} 个文件, 跳过: ${skippedCount} 个文件`);
  } catch (err) {
    console.error('发生错误:', err);
  }
}

// 启动转换
main();