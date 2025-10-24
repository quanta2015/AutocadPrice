import pymupdf as fitz

def add_dark_background(input_pdf, output_pdf, bg_color=(0.1, 0.1, 0.1)): # 深灰色
    doc = fitz.open(input_pdf)
    
    for page in doc:
        rect = page.rect
        shape = page.new_shape()
        shape.draw_rect(rect)
        shape.finish(fill=bg_color, color=None, fill_opacity=1)
        shape.commit(overlay=False)  # 关键：overlay=False表示置于底层


    # 保存修改后的文档
    doc.save(output_pdf)
    doc.close()


# 使用示例
add_dark_background("input.pdf", "dark_background.pdf", bg_color=(0.1, 0.1, 0.1))


