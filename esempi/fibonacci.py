"""Stampa i primi N numeri della serie di Fibonacci"""

import sys

def fibonacci(n):
    seq = []
    a, b = 0, 1
    for _ in range(n):
        seq.append(a)
        a, b = b, a + b
    return seq

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Uso: fibonacci.py N")
    else:
        N = int(sys.argv[1])
        print(fibonacci(N))
