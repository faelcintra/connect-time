import { Box, Heading, Text, styled } from '@ignite-ui/react'

export const Header = styled('div', {
  paddign: '0 $4',

  [`>${Heading}`]: {
    lineHeight: '$base',
  },
  [`>${Text}`]: {
    color: '$gray200',
    marginBotto: '$6',
  },
})

export const Container = styled('main', {
  maxWidth: 572,
  margin: '$20 auto $4',
  paddign: '0 $4',
})

export const Form = styled(Box, {
  marginTop: '$6',
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',

  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '$2',
  },
})

export const FormError = styled(Text, {
  color: '#FC5D5D',
})
