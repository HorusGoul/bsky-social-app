import React from 'react'
import {observer} from 'mobx-react-lite'
import {View, FlatList} from 'react-native'
import {NotificationsViewModel} from '../../../state/models/notifications-view'
import {FeedItem} from './FeedItem'
import {NotificationFeedLoadingPlaceholder} from '../util/LoadingPlaceholder'
import {ErrorMessage} from '../util/error/ErrorMessage'
import {EmptyState} from '../util/EmptyState'
import {OnScrollCb} from '../../lib/hooks/useOnMainScroll'

const EMPTY_FEED_ITEM = {_reactKey: '__empty__'}

export const Feed = observer(function Feed({
  view,
  onPressTryAgain,
  onScroll,
}: {
  view: NotificationsViewModel
  onPressTryAgain?: () => void
  onScroll?: OnScrollCb
}) {
  // TODO optimize renderItem or FeedItem, we're getting this notice from RN: -prf
  //   VirtualizedList: You have a large list that is slow to update - make sure your
  //   renderItem function renders components that follow React performance best practices
  //   like PureComponent, shouldComponentUpdate, etc
  const renderItem = ({item}: {item: any}) => {
    if (item === EMPTY_FEED_ITEM) {
      return (
        <EmptyState
          icon="bell"
          message="No notifications yet!"
          style={{paddingVertical: 40}}
        />
      )
    }
    return <FeedItem item={item} />
  }
  const onRefresh = () => {
    view
      .refresh()
      .catch(err =>
        view.rootStore.log.error(
          'Failed to refresh notifications feed',
          err.toString(),
        ),
      )
  }
  const onEndReached = () => {
    view
      .loadMore()
      .catch(err =>
        view.rootStore.log.error(
          'Failed to load more notifications',
          err.toString(),
        ),
      )
  }
  let data
  if (view.hasLoaded) {
    if (view.isEmpty) {
      data = [EMPTY_FEED_ITEM]
    } else {
      data = view.notifications
    }
  }
  return (
    <View style={{flex: 1}}>
      {view.isLoading && !data && <NotificationFeedLoadingPlaceholder />}
      {view.hasError && (
        <ErrorMessage
          message={view.error}
          style={{margin: 6}}
          onPressTryAgain={onPressTryAgain}
        />
      )}
      {data && (
        <FlatList
          data={data}
          keyExtractor={item => item._reactKey}
          renderItem={renderItem}
          refreshing={view.isRefreshing}
          onRefresh={onRefresh}
          onEndReached={onEndReached}
          onScroll={onScroll}
        />
      )}
    </View>
  )
})
