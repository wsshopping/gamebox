import { gameApi } from './game'
import { tradeApi } from './trade'
import { communityApi } from './community'
import { welfareApi } from './welfare'
import { messageApi } from './message'
import { agencyApi } from './agency'
import { bannerApi } from './banner'
import { searchApi } from './search'
import { userApi } from './user'

export const api = {
  game: gameApi,
  trade: tradeApi,
  community: communityApi,
  welfare: welfareApi,
  message: messageApi,
  agency: agencyApi,
  banner: bannerApi,
  search: searchApi,
  user: userApi
}
