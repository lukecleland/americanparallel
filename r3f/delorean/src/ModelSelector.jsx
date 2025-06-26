import { forwardRef, useRef, useImperativeHandle } from 'react';
import { RotatingThumbnail } from './RotatingThumbnail';
import { useCarStore } from './stores/carStore';

export const ModelSelector = forwardRef(({ models, onSelect }, ref) => {
  const stripRef = useRef(null);
  const selectedIndex = useCarStore((s) => s.index); 

  useImperativeHandle(ref, () => ({
    scrollToIndex: (i) => {
      const child = stripRef.current?.children[i];
      child?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    },
  }));

  return (
    <div
      ref={stripRef}
      style={{
        position: 'absolute',
        bottom: 20,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        zIndex: 10,
        cursor: 'pointer',
        overflowX: 'auto',
      }}
    >
      {models.map((Model, i) => (
        <div onClick={() => (
          console.log(`Selected model: ${Model.name ?? i}`),
          onSelect(i)
        )}>
          <RotatingThumbnail
            key={Model.name ?? i}
            Model={Model}
            active={i === selectedIndex}
          />
        </div>
      ))}
    </div>
  );
});
