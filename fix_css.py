with open("style.css", "r") as f:
    css = f.read()

import re

css = re.sub(r'/\* Fix Flip Card Animation \*/.*?EOF', '', css, flags=re.DOTALL)
css = re.sub(r'/\* Bulletproof 3D Flip \*/.*', '', css, flags=re.DOTALL)
css = re.sub(r'\.preserve-3d \{ transform-style: preserve-3d; \}', '', css)
css = re.sub(r'\.backface-hidden \{ backface-visibility: hidden; \}', '', css)
css = re.sub(r'\.group-hover\\/flip:hover .flip-inner \{.*?\}', '', css, flags=re.DOTALL)

clean_css = css.strip() + """

/* Bulletproof 3D Flip */
.hof-card {
    perspective: 1500px;
    -webkit-perspective: 1500px;
    background-color: transparent;
}
.flip-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
}
.hof-card:hover .flip-inner {
    transform: rotateY(180deg) !important;
    -webkit-transform: rotateY(180deg) !important;
}
.backface-hidden {
    backface-visibility: hidden !important;
    -webkit-backface-visibility: hidden !important;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.rotate-y-180 {
    transform: rotateY(180deg) !important;
    -webkit-transform: rotateY(180deg) !important;
}
"""

with open("style.css", "w") as f:
    f.write(clean_css)
