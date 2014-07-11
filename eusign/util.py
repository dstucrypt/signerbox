import base64

PEM_TEMPLATE = """-----BEGIN {name}-----
{data}
-----END {name}-----"""

def pem(data, name):
    b64 = base64.b64encode(data)
    b64_lines = [
        b64[x:x+64]
        for x in range(0, len(b64), 64)
    ]
    return PEM_TEMPLATE.format(data=str.join("\n", b64_lines), name=name)
