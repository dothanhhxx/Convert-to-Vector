import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

os.makedirs("d:/Github/Convert to Vector/backend/app/samples", exist_ok=True)

# 1. Logo Shield (Colorful clean modern badge)
img1 = Image.new("RGBA", (400, 400), (255, 255, 255, 0))
d1 = ImageDraw.Draw(img1)
# Outer shield
d1.polygon([(200, 30), (350, 90), (320, 290), (200, 370), (80, 290), (50, 90)], fill=(37, 99, 235, 255))
# Inner shield
d1.polygon([(200, 60), (320, 110), (295, 270), (200, 335), (105, 270), (80, 110)], fill=(245, 158, 11, 255))
# Core diamond
d1.polygon([(200, 110), (270, 190), (200, 270), (130, 190)], fill=(239, 68, 68, 255))
# Star center
d1.ellipse([(175, 165), (225, 215)], fill=(255, 255, 255, 255))
img1.save("d:/Github/Convert to Vector/backend/app/samples/logo_shield.png")

# 2. Mascot Robot
img2 = Image.new("RGBA", (400, 400), (255, 255, 255, 0))
d2 = ImageDraw.Draw(img2)
# Head
d2.rounded_rectangle([(100, 100), (300, 270)], radius=30, fill=(16, 185, 129, 255))
# Antennas
d2.rectangle([(190, 40), (210, 100)], fill=(100, 116, 139, 255))
d2.ellipse([(185, 25), (215, 55)], fill=(244, 63, 94, 255))
# Visor
d2.rounded_rectangle([(130, 140), (270, 210)], radius=15, fill=(15, 23, 42, 255))
# Eyes
d2.ellipse([(150, 155), (180, 195)], fill=(56, 189, 248, 255))
d2.ellipse([(220, 155), (250, 195)], fill=(56, 189, 248, 255))
# Cheerful smile
d2.arc([(170, 215), (230, 250)], start=0, end=180, fill=(255, 255, 255, 255), width=4)
# Ears / Screws
d2.ellipse([(75, 160), (105, 210)], fill=(245, 158, 11, 255))
d2.ellipse([(295, 160), (325, 210)], fill=(245, 158, 11, 255))
img2.save("d:/Github/Convert to Vector/backend/app/samples/mascot_robot.png")

# 3. Vintage Crest / Signature (Black and White for Potrace)
img3 = Image.new("RGB", (400, 400), (255, 255, 255))
d3 = ImageDraw.Draw(img3)
# Circles and rings
d3.ellipse([(50, 50), (350, 350)], outline=(17, 24, 39), width=8)
d3.ellipse([(70, 70), (330, 330)], outline=(17, 24, 39), width=3)
d3.ellipse([(140, 140), (260, 260)], outline=(17, 24, 39), width=5)
# Star rays
for angle in range(0, 360, 30):
    rad = np.radians(angle)
    x1 = 200 + int(90 * np.cos(rad))
    y1 = 200 + int(90 * np.sin(rad))
    x2 = 200 + int(125 * np.cos(rad))
    y2 = 200 + int(125 * np.sin(rad))
    d3.line([(x1, y1), (x2, y2)], fill=(17, 24, 39), width=4)
# Center emblem
d3.polygon([(200, 160), (235, 230), (165, 230)], fill=(17, 24, 39))
img3.save("d:/Github/Convert to Vector/backend/app/samples/vintage_crest.png")

print("Generated 3 sample images in samples/ directory successfully.")
