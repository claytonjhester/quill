import { useMemo, useRef, useState } from 'react';
import * as styles from './RubiksCube.module.scss';

const INITIAL = {
  U: Array(9).fill('U'),
  D: Array(9).fill('D'),
  F: Array(9).fill('F'),
  B: Array(9).fill('B'),
  L: Array(9).fill('L'),
  R: Array(9).fill('R'),
};

const COLORS = {
  U: '#ffffff',
  D: '#ffd748',
  F: '#37b24d',
  B: '#2b8aef',
  L: '#ff922b',
  R: '#fa5252',
};

const rotateFaceCW = (face) => [
  face[6],
  face[3],
  face[0],
  face[7],
  face[4],
  face[1],
  face[8],
  face[5],
  face[2],
];

const cycle = (next, strips) => {
  const snapshot = strips.map(([face, indexes]) =>
    indexes.map((index) => next[face][index]),
  );
  strips.forEach(([face, indexes], i) => {
    const source = snapshot[(i + strips.length - 1) % strips.length];
    indexes.forEach((index, j) => {
      next[face][index] = source[j];
    });
  });
};

const MOVES = {
  U: (next) => {
    next.U = rotateFaceCW(next.U);
    cycle(next, [
      ['F', [0, 1, 2]],
      ['R', [0, 1, 2]],
      ['B', [0, 1, 2]],
      ['L', [0, 1, 2]],
    ]);
  },
  D: (next) => {
    next.D = rotateFaceCW(next.D);
    cycle(next, [
      ['F', [6, 7, 8]],
      ['L', [6, 7, 8]],
      ['B', [6, 7, 8]],
      ['R', [6, 7, 8]],
    ]);
  },
  F: (next) => {
    next.F = rotateFaceCW(next.F);
    cycle(next, [
      ['U', [6, 7, 8]],
      ['R', [0, 3, 6]],
      ['D', [2, 1, 0]],
      ['L', [8, 5, 2]],
    ]);
  },
  B: (next) => {
    next.B = rotateFaceCW(next.B);
    cycle(next, [
      ['U', [2, 1, 0]],
      ['L', [0, 3, 6]],
      ['D', [6, 7, 8]],
      ['R', [8, 5, 2]],
    ]);
  },
  L: (next) => {
    next.L = rotateFaceCW(next.L);
    cycle(next, [
      ['U', [0, 3, 6]],
      ['F', [0, 3, 6]],
      ['D', [0, 3, 6]],
      ['B', [8, 5, 2]],
    ]);
  },
  R: (next) => {
    next.R = rotateFaceCW(next.R);
    cycle(next, [
      ['U', [8, 5, 2]],
      ['B', [0, 3, 6]],
      ['D', [8, 5, 2]],
      ['F', [8, 5, 2]],
    ]);
  },
};

const RubiksCube = () => {
  const [faces, setFaces] = useState(INITIAL);
  const [rotation, setRotation] = useState({ x: -24, y: 36 });
  const drag = useRef(null);

  const transform = useMemo(
    () => `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    [rotation],
  );

  const runMove = (move) => {
    setFaces((previous) => {
      const next = Object.fromEntries(
        Object.entries(previous).map(([face, stickers]) => [face, [...stickers]]),
      );
      MOVES[move](next);
      return next;
    });
  };

  const scramble = () => {
    const moveKeys = Object.keys(MOVES);
    for (let i = 0; i < 18; i += 1) {
      const move = moveKeys[Math.floor(Math.random() * moveKeys.length)];
      runMove(move);
    }
  };

  const onPointerDown = (event) => {
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      rotation,
    };
  };

  const onPointerMove = (event) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    setRotation({
      x: Math.max(-80, Math.min(80, drag.current.rotation.x - dy * 0.35)),
      y: drag.current.rotation.y + dx * 0.35,
    });
  };

  const faceStyle = {
    F: { transform: 'translateZ(90px)' },
    B: { transform: 'rotateY(180deg) translateZ(90px)' },
    U: { transform: 'rotateX(90deg) translateZ(90px)' },
    D: { transform: 'rotateX(-90deg) translateZ(90px)' },
    L: { transform: 'rotateY(-90deg) translateZ(90px)' },
    R: { transform: 'rotateY(90deg) translateZ(90px)' },
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>
        Drag to orbit the cube. Use face turns to solve it.
      </p>
      <div
        className={styles.scene}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerLeave={() => {
          drag.current = null;
        }}
      >
        <div className={styles.cube} style={{ transform }}>
          {Object.entries(faceStyle).map(([face, style]) => (
            <div className={styles.face} key={face} style={style}>
              {faces[face].map((sticker, index) => (
                <div
                  className={styles.sticker}
                  key={`${face}-${index}`}
                  style={{ background: COLORS[sticker] }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.controls}>
        {Object.keys(MOVES).map((move) => (
          <button
            className={styles.button}
            key={move}
            onClick={() => {
              runMove(move);
            }}
            type="button"
          >
            {move}
          </button>
        ))}
        <button className={styles.button} onClick={scramble} type="button">
          Scramble
        </button>
        <button
          className={styles.button}
          onClick={() => {
            setFaces(INITIAL);
          }}
          type="button"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default RubiksCube;
