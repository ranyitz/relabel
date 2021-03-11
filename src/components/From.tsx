import React, { useEffect, useState } from 'react';
import { useInput } from 'ink';
import { Box, Text } from 'ink';
import { replaceElement } from '../utils';

type State = {
  inputs: Array<string>;
  cursorOffset: number;
  activeInputIndex: number;
};

type InputDescriptor = {
  placeholder?: string;
  label?: string;
  initialValue?: string;
  validationError?: string | null;
  onChange: (newInput?: string) => void;
};

export const Form = ({
  inputs: inputDescriptors,
  onExit,
  onSubmit,
}: {
  inputs: Array<InputDescriptor>;
  onExit: () => void;
  onSubmit: (state: State) => void;
}) => {
  const initialInputs = inputDescriptors.map(
    (input) => input.initialValue ?? ''
  );

  const [state, setState] = useState<State>({
    inputs: initialInputs,
    cursorOffset: 0,
    activeInputIndex: 1,
  });

  const { inputs, cursorOffset, activeInputIndex } = state;
  const activeInputValue = inputs[activeInputIndex];

  useInput((input, key) => {
    if (key.escape || (key.ctrl && (input === 'c' || input === 'd'))) {
      onExit();
      return;
    } else if (key.ctrl && input === 'u') {
      setState({
        ...state,
        inputs: replaceElement(inputs, activeInputIndex, ''),
        cursorOffset: 0,
      });
    } else if (key.ctrl && input === 'a') {
      setState({ ...state, cursorOffset: 0 });
    } else if (key.ctrl && input === 'e') {
      setState({ ...state, cursorOffset: activeInputValue.length });
    } else if (key.leftArrow) {
      if (cursorOffset > 0) {
        setState({ ...state, cursorOffset: cursorOffset - 1 });
      }
    } else if (key.rightArrow) {
      if (cursorOffset < activeInputValue.length) {
        setState({ ...state, cursorOffset: cursorOffset + 1 });
      }
    } else if (key.return) {
      onSubmit(state);
      return;
    } else if (key.upArrow || (key.tab && key.shift)) {
      const newInputIndex = (activeInputIndex + 3 - 1) % 3;
      const newInputValue = inputs[newInputIndex];

      setState({
        ...state,
        activeInputIndex: newInputIndex,
        cursorOffset: key.tab
          ? 0
          : Math.min(cursorOffset, newInputValue.length),
      });
    } else if (key.downArrow || key.tab) {
      const newInputIndex = (activeInputIndex + 3 + 1) % 3;
      const newInputValue = inputs[newInputIndex];

      setState({
        ...state,
        activeInputIndex: newInputIndex,
        cursorOffset: key.tab
          ? 0
          : Math.min(cursorOffset, newInputValue.length),
      });
    } else {
      if (key.delete || key.backspace) {
        if (cursorOffset > 0) {
          const newInputValue =
            activeInputValue.slice(0, cursorOffset - 1) +
            activeInputValue.slice(cursorOffset);

          setState({
            ...state,
            cursorOffset: cursorOffset - 1,
            inputs: replaceElement(inputs, activeInputIndex, newInputValue),
          });
        }
      } else {
        const newInputValue =
          activeInputValue.slice(0, cursorOffset) +
          input +
          activeInputValue.slice(cursorOffset);

        setState({
          ...state,
          cursorOffset: cursorOffset + input.length,
          inputs: replaceElement(inputs, activeInputIndex, newInputValue),
        });
      }
    }
  });

  return (
    <Box flexDirection="column">
      {inputDescriptors.map((descriptor, index) => {
        return (
          <Input
            key={index}
            placeholder={descriptor.placeholder}
            initialValue={descriptor.initialValue}
            onChange={descriptor.onChange}
            label={descriptor.label}
            validationError={descriptor.validationError}
            active={activeInputIndex === index}
            value={state.inputs[index]}
            cursorOffset={cursorOffset}
          />
        );
      })}
    </Box>
  );
};

export const Input = ({
  placeholder,
  active,
  value,
  validationError,
  onChange,
  cursorOffset,
  label,
}: {
  placeholder?: string;
  active?: boolean;
  value?: string;
  initialValue?: string;
  onChange: (newInput?: string) => void;
  cursorOffset: number;
  validationError?: string | null;
  label?: string;
}) => {
  useEffect(() => onChange(value), [value]);

  const textWithCursor = (text?: string) => {
    if (!text) {
      return <Text inverse> </Text>;
    }

    if (cursorOffset === text.length) {
      return (
        <Text>
          {text}
          <Text inverse> </Text>
        </Text>
      );
    }

    return (
      <>
        <Text>{text.substr(0, cursorOffset)}</Text>
        <Text inverse>{text.substr(cursorOffset, 1)}</Text>
        <Text>{text.substr(cursorOffset + 1)}</Text>
      </>
    );
  };

  return (
    <Text>
      <Text color="blue" dimColor={!active}>
        {label}
      </Text>
      {<Text dimColor={!active}>{'|'}</Text>}
      {!value && placeholder ? (
        <Text color="dim">
          {active ? textWithCursor(placeholder) : placeholder}
        </Text>
      ) : (
        <Text>
          {active ? textWithCursor(value) : value}
          <Text color="red"> {validationError}</Text>
        </Text>
      )}
    </Text>
  );
};
