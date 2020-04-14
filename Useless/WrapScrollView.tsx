//--------------------------------------------------
/**
 * スクロールラッパー
 * スクロールが上部・下部に届いた際の処理を追加してラップしたもの。
 * 引っ張った場合の処理も追加
 */
//--------------------------------------------------
/* React Native */
import * as React from 'react';
import { ScrollView, NativeSyntheticEvent, NativeScrollEvent, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';

export class WrapScrollView extends React.Component<{
  // スタイル
  style?: StyleProp<ViewStyle>;
  // オーバースクロールモード
  overScrollMode?: "always" | "never" | "auto";
  // ソート方向
  horizontal?: boolean;
  
  // イベント発火に必要な引っ張り値
  pullTriggerLengthiOS?: number;
  // スクロールが上部を超えた時の処理
  pullOverBeganiOS?: () => void;
  // スクロールが下部を超えた時の処理
  pullOverEndiOS?: () => void;

  // スクロール後の処理の判定範囲
  onScrolledLength?: number;
  // 上部にスクロールが到達した場合の処理
  onScrolledTop?: () => void;
  // 下部にスクロールが到達した場合の処理
  onScrolledBottom?: () => void;

  // ScrollViewへの参照を外部に渡す
  ref?: (ref: ScrollView) => void;

  // 純正メソッド
  onTouchStart?: (event: GestureResponderEvent) => void;
  onTouchMove?: (event: GestureResponderEvent) => void;
  onTouchEnd?: (event: GestureResponderEvent) => void;
  onContentSizeChange?: (w: number, h: number) => void;
  onScrollBeginDrag?: (event:  NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag?: (event:  NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollBegin?: (event:  NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd?: (event:  NativeSyntheticEvent<NativeScrollEvent>) => void;
}>{
  // スクロールビューの参照
  private _ref: ScrollView|null = null;

  public constructor(props: any){
    super(props);
  }

  /**
   * スクロールビューのドラッグ終了時の処理
   */
  private onScrollEndDrag = (event:  NativeSyntheticEvent<NativeScrollEvent>): void => {
    // 自前で処理を組んでいない場合のみ有効
    if( !this.props.onScrollEndDrag ){
      // 表示サイズ
      const viewSize = this.props.horizontal ? event.nativeEvent.layoutMeasurement.width : event.nativeEvent.layoutMeasurement.height;
      // 表示物の制御座標
      const offset = this.props.horizontal ? event.nativeEvent.contentOffset.x: event.nativeEvent.contentOffset.y;
      // コンテンツサイズ
      const contentSize = this.props.horizontal ? event.nativeEvent.contentSize.width : event.nativeEvent.contentSize.height;

      // プルオーバーイベント
      this.pullOverEvent(viewSize, offset, contentSize);
    }else{
      // 自前実装
      this.props.onScrollEndDrag( event );
    }
  }

  /**
   * 引っ張った時にイベントを発火させる
   * @param viewSize 表示サイズ
   * @param offset 内部座標
   * @param contentSize コンテンツサイズ
   */
  private pullOverEvent = (viewSize: number, offset: number, contentSize: number): void => {
    // イベントを発火させるのに必要な引っ張り
    const triggerLength = this.props.pullTriggerLengthiOS && Math.abs( this.props.pullTriggerLengthiOS ) || 30;

    // スタート地点より大きく引っ張ったか
    if( offset < -triggerLength ){
      this.props.pullOverBeganiOS && this.props.pullOverBeganiOS();
      this.scrollTo(0);
    }

    // 最終地点より大きく引っ張ったか
    if( (offset + viewSize) > (contentSize + triggerLength) ){
      this.props.pullOverEndiOS && this.props.pullOverEndiOS();
      this.scrollTo( (contentSize - viewSize) )
    }
  }

  /**
   * 目的座標までスクロールする
   */
  private scrollTo = (value: number) => {
    const horizontal = this.props.horizontal;
    this._ref && this._ref.scrollTo({
      y: horizontal ? 0 :value,
      x: horizontal ? value : 0,
      animated: true,
    });
  }

  /**
   * スクロール停止時の処理
   */
  private onMomentumScrollEnd = (event:  NativeSyntheticEvent<NativeScrollEvent>): void => {
    // 自前で処理を組んでいない場合のみ有効
    if( !this.props.onMomentumScrollEnd ){
      // 表示サイズ
      const viewSize = this.props.horizontal ? event.nativeEvent.layoutMeasurement.width : event.nativeEvent.layoutMeasurement.height;
      // 表示物の制御座標
      const offset = this.props.horizontal ? event.nativeEvent.contentOffset.x: event.nativeEvent.contentOffset.y;
      // コンテンツサイズ
      const contentSize = this.props.horizontal ? event.nativeEvent.contentSize.width : event.nativeEvent.contentSize.height;

      // スクロールドイベント
      this.scrolledEvent(viewSize, offset, contentSize);
    }else{
      // 自前実装
      this.props.onMomentumScrollEnd( event );
    }
  }

  /**
   * スクロールドイベント
   * @param viewSize 表示サイズ
   * @param offset 内部座標
   * @param contentSize コンテンツサイズ
   */
  private scrolledEvent = (viewSize: number, offset: number, contentSize: number): void => {
    // イベントを発火させるのに必要な範囲
    const triggerLength = this.props.onScrolledLength && Math.abs( this.props.onScrolledLength ) || 0;

    // スクロールがトップに到達
    if( offset < triggerLength ){
      this.props.onScrolledTop && this.props.onScrolledTop();
    }

    // スクロールがボトムに到達
    if( (offset + viewSize) > (contentSize - triggerLength) ){
      this.props.onScrolledBottom && this.props.onScrolledBottom();
    }
  }

  public render(): JSX.Element{
    const getRef = ( ref: ScrollView ) => {
      this._ref = ref;
      this.props.ref && this.props.ref(ref);
    };

    return(
      <ScrollView

        onResponderRelease={ (e)=>{console.log(e.nativeEvent.locationY)} }

        ref={ getRef }
        style={ this.props.style }
        overScrollMode={ this.props.overScrollMode }
        horizontal={ this.props.horizontal }
        onTouchStart={ this.props.onTouchStart }
        onTouchMove={ this.props.onTouchMove }
        onTouchEnd={ this.props.onTouchEnd }
        onContentSizeChange={ this.props.onContentSizeChange }
        onScrollBeginDrag={ this.props.onScrollBeginDrag }
        onScrollEndDrag={ this.onScrollEndDrag }
        onMomentumScrollBegin={ this.props.onMomentumScrollBegin }
        onMomentumScrollEnd={ this.onMomentumScrollEnd } >
        { this.props.children }
      </ScrollView>
    )
  }
}