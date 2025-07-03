"""Calcolatrice da linea di comando"""

import operator
import sys

OPERAZIONI = {
    '+': operator.add,
    '-': operator.sub,
    '*': operator.mul,
    '/': operator.truediv,
}

def main():
    if len(sys.argv) != 4 or sys.argv[2] not in OPERAZIONI:
        print("Uso: calcolatrice.py numero operazione numero")
        print("Esempio: calcolatrice.py 2 + 3")
        return
    a = float(sys.argv[1])
    op = sys.argv[2]
    b = float(sys.argv[3])
    risultato = OPERAZIONI[op](a, b)
    print("Risultato:", risultato)

if __name__ == '__main__':
    main()
