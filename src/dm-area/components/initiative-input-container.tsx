import * as React from "react";
import { TemplateContext } from "./html-container";
import {
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    HStack,
    Button,
    VStack,
    Checkbox,
    Badge, 
    Text
  } from '@chakra-ui/react'

export const InitiativeInputContainer: React.FC<{
    message?: string;
    templateId?: string;
    [key: string]: any;
  }> = ({ children, templateId, ...props }) => {
    const templateMap = React.useContext(TemplateContext);
    let message = props.message;
  
    // const controls = new Map<string, ComplexOption>();
    // const variables: VariablesMap = new Map();
  
    if (templateId) {
      const template = templateMap.get(templateId);
      if (template == null) {
        message = "ERROR: Cannot find template";
      } 
    //   else {
    //     for (const [name, variable] of template.variables.entries()) {
    //       if (variable.value.type === "plainAttributeValue") {
    //         const maybeJSONValue = tryParseJsonSafe(name)(variable.value.value);
    //         if (maybeJSONValue) {
    //           controls.set(name, maybeJSONValue);
    //         }
    //       } else if (variable.value.type === "stringAttributeValue") {
    //         variables.set(name, variable.value.value);
    //       }
    //     }
    //     message = template.content;
  
    //     const replaceVariables = getVariableProps(props);
  
    //     for (const { name, value } of replaceVariables) {
    //       message = message.replace(new RegExp(`{{${name}}}`, "g"), value);
    //     }
    //   }
    } else if (!message) {
      message = "ERROR: Cannot find template";
    }

    const [initiativeRoll, SetInitiativeRoll] = React.useState(0)
    const HandelInitiativeRoll = (value: any) => {
        SetInitiativeRoll(value)
        console.log("changhed valui", value)
    }

    const [submitedInitiative, setSubmitedInitiative] = React.useState(false);
    const HandelInitiativeRollSub = () => {
        setSubmitedInitiative(true);
        console.log("changhed valui", initiativeRoll)
    }

    const HandelRedoInitiativeRollSub = () => {
      setSubmitedInitiative(false);
      console.log("changhed valui", initiativeRoll)
  }
  
    return (
    <VStack>
      <Text fontSize='xl' fontWeight='bold'>
        Enter Initiative
        {!submitedInitiative ? 
          <Badge ml='1' fontSize='0.8em' colorScheme='yellow'>
            Waiting for you
          </Badge> : 
          <Badge ml='1' fontSize='0.8em' colorScheme='green'>
            Ready
          </Badge>
        }
      </Text>

      {submitedInitiative ? 
      <>
        <Button colorScheme='yellow' variant='solid' onClick={HandelRedoInitiativeRollSub}>
          Re-Submit Initiative
        </Button>
      </> 
      : 
      <>
        <Checkbox size='lg' colorScheme='orange' defaultChecked>
          Add proficiency and other bonuses
        </Checkbox>
        <HStack>
            <NumberInput size='md' maxW={24} value={initiativeRoll} min={1} onChange={(value)=>{HandelInitiativeRoll(value)}}>
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
            <Button colorScheme='teal' variant='solid' onClick={HandelInitiativeRollSub}>
                Submit Initiative
            </Button>
        </HStack>
      </>
      }
    </VStack>
    );
  };