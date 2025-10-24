from pdf2image import convert_from_path
from PIL import Image
import img2pdf
import os

def pdf_to_grayscale_image(input_pdf, output_pdf, dpi=150):
    """
    通过图像处理将PDF转换为灰度PDF。

    参数:
        input_pdf (str): 输入的PDF文件路径。
        output_pdf (str): 输出的灰度PDF文件路径。
        dpi (int): 转换图像的分辨率，值越高越清晰，但文件越大、处理越慢。
    """
    print("正在将PDF页面转换为图像...")
    # 将PDF每一页转换为PIL图像对象列表
    images = convert_from_path(input_pdf, dpi=dpi)

    grayscale_images = []
    print("正在处理图像为灰度...")
    for i, image in enumerate(images):
        # 将彩色图像转换为灰度图像（'L'模式代表灰度）
        gray_image = image.convert('L')
        grayscale_images.append(gray_image)

    print("正在将灰度图像合并为PDF...")
    # 方法1：使用img2pdf库，生成的文件较小
    with open(output_pdf, "wb") as f:
        f.write(img2pdf.convert([img.filename for img in grayscale_images])) # 注意：这里需要图像已保存到文件
    # 方法2（备选）：如果上述方法有问题，可以先将图像保存到临时文件再转换
    # temp_image_paths = []
    # for i, img in enumerate(grayscale_images):
    #     path = f"temp_page_{i}.png"
    #     img.save(path, "PNG")
    #     temp_image_paths.append(path)
    # with open(output_pdf, "wb") as f:
    #     f.write(img2pdf.convert(temp_image_paths))
    # # 清理临时文件
    # for path in temp_image_paths:
    #     os.remove(path)

    print("转换成功！")

# 使用示例
pdf_to_grayscale_image("input.pdf", "output_grayscale.pdf")
