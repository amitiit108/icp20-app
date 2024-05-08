import { Chef, PairType } from '../features/onsen/enum'
import {
  useAverageBlockTime,
  useBlock,
  useEthPrice,
  useFarms,
  useLICPPrice,
  // useKashiPairs,
  useMasterChefV1SushiPerBlock,
  useMasterChefV1TotalAllocPoint,
  useMaticPrice,
  useNativePrice,
  useOnePrice,
  useStakePrice,
  useSushiPairs,
  useSushiPrice,
} from '../services/graph'

import { ChainId, MASTERCHEF_ADDRESS, JSBI } from '@sushiswap/sdk'
import { getAddress } from '@ethersproject/address'
import useActiveWeb3React from './useActiveWeb3React'
import { useCallback, useMemo } from 'react'
import { usePositions } from '../features/onsen/hooks'
import { aprToApy } from '../functions/convert/apyApr'
import { useTokenBalances } from '../state/wallet/hooks'
import { Token, ZERO } from '@sushiswap/sdk'
import { useMasterChefContract } from '.'
import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/hooks'

export function useMasterInfoCheck() {
  const { account } = useActiveWeb3React()

  const contract = useMasterChefContract(false)

  console.log('useMasterChef', contract)

  // Deposit
  const rewardPerBlock = useCallback(async () => {
    try {
      let tx = await contract?.rewardPerBlock()
      return tx
    } catch (e) {
      console.error(e)
      return e
    }
  }, [account, contract])
  return { rewardPerBlock }
}

export function useMasterChefRewardPerBlock() {
  const { account, chainId } = useActiveWeb3React()

  const contract = useMasterChefContract(false)

  const info = useSingleCallResult(contract, 'rewardPerBlock')?.result

  const value = info?.[0]

  console.log('useMasterChefRewardPerBlock', info, contract)

  const amount = value ? JSBI.BigInt(value.toString()) : undefined

  return useMemo(() => {
    if (amount) {
      const rewardPerblock = JSBI.toNumber(amount) / 1e18
      return rewardPerblock
    }
    return 0
  }, [amount])
}

export default function useFarmRewards() {
  // const { chainId } = useActiveWeb3React()

  const { rewardPerBlock } = useMasterInfoCheck()

  let value = rewardPerBlock()

  const chainId = ChainId.MATIC

  const positions = usePositions(chainId)

  const block1w = useBlock({ daysAgo: 7, chainId })

  const farms = [
    {
      accSushiPerShare: '',
      allocPoint: 100,
      balance: 0,
      chef: 0,
      id: '0',
      lastRewardTime: 1631266290,
      owner: {
        id: '0x8542cA07fd24356955024dc37E9273e6176451B2',
        totalAllocPoint: 200,
      },
      pair: '0x47ee7e6a997ba0d1b02b1de786a6324f8e8cef20',
      slpBalance: 0,
      userCount: '0',
    },
    // {
    //   accSushiPerShare: '',
    //   allocPoint: 0,
    //   balance: 0,
    //   chef: 0,
    //   id: '1',
    //   lastRewardTime: 1631266290,
    //   owner: {
    //     id: '0xA87ac87dc6AB9679ae113890209D8a0728c7F7Fc',
    //     totalAllocPoint: 100,
    //   },
    //   pair: '0x5d8f1923643f822e2ce6634ad14f273276a78c30',
    //   slpBalance: 0,
    //   userCount: '0',
    // },
    // {
    //   accSushiPerShare: '',
    //   allocPoint: 0,
    //   balance: 0,
    //   chef: 0,
    //   id: '2',
    //   lastRewardTime: 1631266290,
    //   owner: {
    //     id: '0xA87ac87dc6AB9679ae113890209D8a0728c7F7Fc',
    //     totalAllocPoint: 100,
    //   },
    //   pair: '0x3a254c9065264b9bbb394a925b0f44194c5fe847',
    //   slpBalance: 0,
    //   userCount: '0',
    // },
    // {
    //   accSushiPerShare: '',
    //   allocPoint: 0,
    //   balance: 0,
    //   chef: 0,
    //   id: '2',
    //   lastRewardTime: 1631266290,
    //   owner: {
    //     id: '0xA87ac87dc6AB9679ae113890209D8a0728c7F7Fc',
    //     totalAllocPoint: 100,
    //   },
    //   pair: '0x3a254c9065264b9bbb394a925b0f44194c5fe847',
    //   slpBalance: 0,
    //   userCount: '0',
    // },
         {
       accSushiPerShare: '',
       allocPoint: 100,
       balance: 0,
       chef: 0,
       id: '3',
       lastRewardTime: 1631266290,
       owner: {
         id: '0x8542cA07fd24356955024dc37E9273e6176451B2',
         totalAllocPoint: 200,
       },
       pair: '0x32340eb37cd354b24fd7a1ed654ae2dfd22805e7',
       slpBalance: 0,
       userCount: '0',
     },

  ]

  const liquidityTokens = useMemo(
    () =>
      farms.map((farm) => {
        const token = new Token(chainId, getAddress(farm.pair), 18, 'SLP')
        return token
      }),
    [farms]
  )

  const stakedBalaces = useTokenBalances(MASTERCHEF_ADDRESS[ChainId.MATIC], liquidityTokens)

  // const chfarms = useFarms({ chainId })
  const farmAddresses = useMemo(() => farms.map((farm) => farm.pair), [farms])
  const swapPairs = useSushiPairs({ subset: farmAddresses, shouldFetch: !!farmAddresses, chainId })

  const swapPairs1w = useSushiPairs({
    subset: farmAddresses,
    block: block1w,
    shouldFetch: !!block1w && !!farmAddresses,
    chainId,
  })
  // const kashiPairs = useKashiPairs({ subset: farmAddresses, shouldFetch: !!farmAddresses, chainId })

  const averageBlockTime = useAverageBlockTime()
  const masterChefV1TotalAllocPoint = 200
  useMasterChefV1TotalAllocPoint()

  const masterChefV1SushiPerBlock = useMasterChefRewardPerBlock()

  console.log('masterChefV1SushiPerBlock:', masterChefV1SushiPerBlock)

  const [sushiPrice, licpPrice, ethPrice, maticPrice, stakePrice, onePrice] = [
    useSushiPrice(),
    useLICPPrice(),
    useEthPrice(),
    useMaticPrice(),
    useStakePrice(),
    useOnePrice(),
  ]

  const blocksPerDay = 86400 / Number(averageBlockTime)

  const map = (pool) => {
    // TODO: Deal with inconsistencies between properties on subgraph
    pool.owner = pool?.owner || pool?.masterChef || pool?.miniChef
    pool.balance = pool?.balance || pool?.slpBalance

    const swapPair = swapPairs?.find((pair) => pair.id === pool.pair)
    const swapPair1w = swapPairs1w?.find((pair) => pair.id === pool.pair)
    // const kashiPair = kashiPairs?.find((pair) => pair.id === pool.pair)

    const pair = swapPair
    const pair1w = swapPair1w

    const type = swapPair ? PairType.SWAP : PairType.KASHI

    const blocksPerHour = 3600 / averageBlockTime

    function getRewards() {
      // TODO: Some subgraphs give sushiPerBlock & sushiPerSecond, and mcv2 gives nothing
      const sushiPerBlock =
        pool?.owner?.sushiPerBlock / 1e18 ||
        (pool?.owner?.sushiPerSecond / 1e18) * averageBlockTime ||
        masterChefV1SushiPerBlock

      const rewardPerBlock = (pool.allocPoint / pool.owner.totalAllocPoint) * sushiPerBlock

      const defaultReward = {
        token: 'LICP',
        icon: '/images/tokens/licp.png',
        rewardPerBlock,
        rewardPerDay: rewardPerBlock * blocksPerDay,
        rewardPrice: licpPrice,
      }

      let rewards = [defaultReward]

      if (pool.chef === Chef.MASTERCHEF_V2) {
        // override for mcv2...
        pool.owner.totalAllocPoint = masterChefV1TotalAllocPoint

        const icon = ['0', '3', '4', '8'].includes(pool.id)
          ? `https://raw.githubusercontent.com/sushiswap/icons/master/token/${pool.rewardToken.symbol.toLowerCase()}.jpg`
          : `https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/ethereum/assets/${getAddress(
              pool.rewarder.rewardToken
            )}/logo.png`

        const decimals = 10 ** pool.rewardToken.decimals

        const rewardPerBlock =
          pool.rewardToken.symbol === 'ALCX'
            ? pool.rewarder.rewardPerSecond / decimals
            : (pool.rewarder.rewardPerSecond / decimals) * averageBlockTime

        const rewardPerDay =
          pool.rewardToken.symbol === 'ALCX'
            ? (pool.rewarder.rewardPerSecond / decimals) * blocksPerDay
            : (pool.rewarder.rewardPerSecond / decimals) * averageBlockTime * blocksPerDay

        const reward = {
          token: pool.rewardToken.symbol,
          icon: icon,
          rewardPerBlock: rewardPerBlock,
          rewardPerDay: rewardPerDay,
          rewardPrice: pool.rewardToken.derivedETH * ethPrice,
        }

        rewards[1] = reward
      } else if (pool.chef === Chef.MINICHEF) {
        const sushiPerSecond = ((pool.allocPoint / pool.miniChef.totalAllocPoint) * pool.miniChef.sushiPerSecond) / 1e18
        const sushiPerBlock = sushiPerSecond * averageBlockTime
        const sushiPerDay = sushiPerBlock * blocksPerDay
        const rewardPerSecond =
          ((pool.allocPoint / pool.miniChef.totalAllocPoint) * pool.rewarder.rewardPerSecond) / 1e18
        const rewardPerBlock = rewardPerSecond * averageBlockTime
        const rewardPerDay = rewardPerBlock * blocksPerDay

        const reward = {
          [ChainId.MATIC]: {
            token: 'MATIC',
            icon: 'https://raw.githubusercontent.com/sushiswap/icons/master/token/polygon.jpg',
            rewardPrice: maticPrice,
            rewardPerBlock,
            rewardPerDay,
          },
          [ChainId.XDAI]: {
            token: 'STAKE',
            icon: 'https://raw.githubusercontent.com/sushiswap/icons/master/token/stake.jpg',
            rewardPerBlock,
            rewardPerDay,
            rewardPrice: stakePrice,
          },
          [ChainId.HARMONY]: {
            token: 'ONE',
            icon: 'https://raw.githubusercontent.com/sushiswap/icons/master/token/one.jpg',
            rewardPrice: onePrice,
          },
        }

        rewards[0] = {
          ...defaultReward,
          rewardPerBlock: sushiPerBlock,
          rewardPerDay: sushiPerDay,
        }

        if (chainId in reward) {
          rewards[1] = reward[chainId]
        }
      }

      return rewards
    }

    const rewards = getRewards()

    let balance = swapPair ? Number(pool.balance / 1e18) : 0

    if (stakedBalaces) {
      const stakedBalance = Object.values(stakedBalaces).find(
        (token) => token.currency.address.toLowerCase() === pool.pair
      )
      console.log('stakedBalace:', pool.pair, stakedBalance?.toExact())
      if (stakedBalance) {
        balance = parseFloat(stakedBalance.toExact())
      }
    }

    const tvl = swapPair ? (balance / Number(swapPair.totalSupply)) * Number(swapPair.reserveUSD) : 0

    let feeApyPerYear = swapPair
      ? aprToApy((((((pair?.volumeUSD - pair1w?.volumeUSD) * 0.0025) / 7) * 365) / pair?.reserveUSD) * 100, 3650) / 100
      : 0

    if (isNaN(feeApyPerYear)) {
      feeApyPerYear = 0
    }

    const feeApyPerMonth = feeApyPerYear / 12
    const feeApyPerDay = feeApyPerMonth / 30
    const feeApyPerHour = feeApyPerDay / blocksPerHour

    const roiPerBlock =
      rewards.reduce((previousValue, currentValue) => {
        return previousValue + currentValue.rewardPerBlock * currentValue.rewardPrice
      }, 0) / tvl

    const rewardAprPerHour = roiPerBlock * blocksPerHour
    const rewardAprPerDay = rewardAprPerHour * 24
    const rewardAprPerMonth = rewardAprPerDay * 30
    const rewardAprPerYear = rewardAprPerMonth * 12

    const roiPerHour = rewardAprPerHour + feeApyPerHour
    const roiPerMonth = rewardAprPerMonth + feeApyPerMonth
    const roiPerDay = rewardAprPerDay + feeApyPerDay
    const roiPerYear = rewardAprPerYear + feeApyPerYear

    const position = positions.find((position) => position.id === pool.id && position.chef === pool.chef)

    return {
      ...pool,
      ...position,
      pair: {
        ...pair,
        decimals: pair.type === PairType.KASHI ? Number(pair.asset.tokenInfo.decimals) : 18,
        type,
      },
      balance,
      feeApyPerHour,
      feeApyPerDay,
      feeApyPerMonth,
      feeApyPerYear,
      rewardAprPerHour,
      rewardAprPerDay,
      rewardAprPerMonth,
      rewardAprPerYear,
      roiPerBlock,
      roiPerHour,
      roiPerDay,
      roiPerMonth,
      roiPerYear,
      rewards,
      tvl,
    }
  }

  return farms
    .filter((farm) => {
      return swapPairs && swapPairs.find((pair) => pair.id === farm.pair)
    })
    .map(map)
}
