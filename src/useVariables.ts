import { useEffect, useState } from 'react';
import dat from 'dat.gui';
import { useDispatch, useSelector } from 'react-redux';
import { Config, setConfig } from './slices/config.slice';
import { useDebouncedCallback } from 'use-debounce';
import { RootState } from './store';

const gui = new dat.GUI();

const add = (data: Config, onChange: (key: keyof Config) => (value: any) => void, target = gui) => {
  return {
    target,
    number: (key: keyof Config, name: string, min: number, max: number) => {
      target.add(data, key, min, max).name(name).onChange(onChange(key));
    },
    boolean: (key: keyof Config, name: string) => {
      target.add(data, key).name(name).onChange(onChange(key));
    },
    folder: (name: string) => {
      return add(data, onChange, gui.addFolder(name));
    },
  };
};

const setup = (data: Config, onChange: (key: keyof Config) => (value: any) => void) => {
  const root = add(data, onChange);

  root.number('viewWidth', 'width', 1, 1000);
  root.number('viewHeight', 'height', 1, 1000);

  const grid = root.folder('grid');
  grid.target.open();

  grid.number('gridCellSize', 'size', 1, 10);
  grid.boolean('showGrid', 'show');
  grid.boolean('snapToGrid', 'snap');

  const viewBox = root.folder('view box');
  viewBox.target.open();

  viewBox.number('viewBoxX', 'x', -100, 100);
  viewBox.number('viewBoxY', 'y', -100, 100);
  viewBox.number('viewBoxWidth', 'width', 1, 100);
  viewBox.number('viewBoxHeight', 'height', 1, 100);
};

const useVariables = () => {
  const config = useSelector((state: RootState) => state.config);
  const [nextConfig, setNextConfig] = useState(config);

  const dispatch = useDispatch();

  const setConfigDebounced = useDebouncedCallback(
    (key: keyof Config, value: any) => dispatch(setConfig({ [key]: value })),
    1000
  );

  const handleChange = (key: keyof Config) => (value: any) => {
    setNextConfig((config) => ({ ...config, [key]: value }));
    setConfigDebounced(key, value);
  };

  useEffect(() => setup({ ...config }, handleChange), []);

  return nextConfig;
};

export default useVariables;
