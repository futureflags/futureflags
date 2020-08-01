import { Box, Spinner } from '@chakra-ui/core'
import React from 'react'

export default function PageLoader() {
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner />
    </Box>
  )
}
