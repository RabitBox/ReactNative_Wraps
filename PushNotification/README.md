# PushNotification
プッシュ通知処理のラッパーコンポーネント。  
デバイストークンの取得、ハンドルと登録・破棄を自動的に行う。  

```ts
import React from 'react';
import { PushNotification } from './PushNotification';

/*
 * プッシュ通知で送られてくるオブジェクト
 */
interface NotificationObject{
  title: string;
  id: number;
  uri?: string;
}

export default class App extends React.Component {

  private getToken = (token: string): void => {
    console.log("Token :", token);
  }

  private foreground = ( notification: any ): void => {
    console.log("Foreground :", notification.data);
  }

  private background = ( notification: any ): void => {
    console.log("Background :", notification.data);
  }

  public render(){
    return(
      <PushNotification<NotificationObject>
        getToken={ this.getToken }
        foreground={ this.foreground }
        background={ this.background } >
        <View/>
      </PushNotification>
    );
  }
}
```

## Props
* getToken( token )  
デバイストークン取得時の処理。起動時にパーミッションが許容されていれば走る。

* foreground( notification )  
アプリを実行している時に走る処理。  

* background( notification )  
アプリ未起動、またはバックグラウンドで実行している時に通知をタップした際に走る処理。