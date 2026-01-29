import { gameApi } from './game'
import { tradeApi } from './trade'
import { communityApi } from './community'
import { welfareApi } from './welfare'
import { messageApi } from './message'
import { messageAdminApi } from './messageAdmin'
import { agencyApi } from './agency'
import { bannerApi } from './banner'
import { searchApi } from './search'
import { userApi } from './user'
import { imApi } from './im'
import { friendApi } from './friend'

export const api = {
  game: gameApi,
  trade: tradeApi,
  community: communityApi,
  welfare: welfareApi,
  message: messageApi,
  messageAdmin: messageAdminApi,
  agency: agencyApi,
  banner: bannerApi,
  search: searchApi,
  user: userApi,
  im: imApi,
  friend: friendApi
}
