import { Currency, Token } from '@sushiswap/sdk'

import { useSushiBarContract } from './useContract'
import { useTransactionAdder } from '../state/transactions/hooks'

import { ChainId, CurrencyAmount, JSBI } from '@sushiswap/sdk'
import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react'

import { Contract } from '@ethersproject/contracts'

import { Zero } from '@ethersproject/constants'
import concat from 'lodash/concat'
import zip from 'lodash/zip'
import { useChefContract } from '../features/onsen/hooks'
import { useActiveWeb3React, useContract, useTokenContract } from '.'
import { useSingleCallResult } from '../state/multicall/hooks'
import { ICP20, ST_ICP, SUSHI } from '../config/tokens'
import { useToken } from './Tokens'
import { st_ICP_ADDRESS, WICP_ADDRESS } from '../constants'
import { useTokenBalance } from '../state/wallet/hooks'

export function useIcpBar() {
  const { account, chainId } = useActiveWeb3React()

  const icp20Contract = useTokenContract(WICP_ADDRESS)

  const result1 = useSingleCallResult(icp20Contract, 'balanceOf', [st_ICP_ADDRESS])?.result

  const value1 = result1?.[0]

  const amount1 = value1 ? JSBI.BigInt(value1.toString()) : undefined

  // const totalStaked = useTokenBalance(st_ICP_ADDRESS, ICP20)

  const contract = useSushiBarContract()

  const result = useSingleCallResult(contract, 'totalSupply')?.result

  const value = result?.[0]

  const amount = value ? JSBI.BigInt(value.toString()) : undefined

  return useMemo(() => {
    if (amount && amount1) {
      const ratio = JSBI.toNumber(amount1) / JSBI.toNumber(amount)
      const totalSupply = CurrencyAmount.fromRawAmount(ST_ICP, amount)
      return [ratio, totalSupply]
    }
    return [undefined, undefined]
  }, [amount, amount1])
}

export function useIcpBarUserInfo() {
  const { account, chainId } = useActiveWeb3React()

  const contract = useSushiBarContract()

  const args = useMemo(() => {
    if (!account) {
      return
    }
    return [String(account)]
  }, [account])

  const userInfo = useSingleCallResult(args ? contract : null, 'userInfo', args)?.result

  const value = userInfo?.unlockTime

  const amount = value ? JSBI.BigInt(value.toString()) : undefined

  return useMemo(() => {
    if (amount) {
      const unlockTimestamp = JSBI.toNumber(amount)

      const unlockTime = new Date(unlockTimestamp * 1000)

      return unlockTime
    }
    return undefined
  }, [amount])
}
