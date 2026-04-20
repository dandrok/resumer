import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import { LlmProviderDefinition } from "../../llm/types"
import { Dispatch, SetStateAction } from "react"



type LlmKeyProps = {
  value: string,
  onChange: Dispatch<SetStateAction<string>>,
  onSubmit: (s: string) => void,
  providerDefinition: LlmProviderDefinition
}

export const LlmKey = ({ value, onChange, onSubmit, providerDefinition }: LlmKeyProps) => {
  return (
    <Box flexDirection="column">
      <Text>{providerDefinition.keyLabel || 'Enter LLM API key:'}</Text>
      <TextInput value={value} onChange={onChange} onSubmit={onSubmit} mask="*" />
    </Box>
  )
}
