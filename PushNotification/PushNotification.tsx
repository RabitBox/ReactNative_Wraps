//--------------------------------------------------
/**
 * Expo Push Notifications Wraper
 */
//--------------------------------------------------
/* React */
import React from 'react';
/* Expo */
import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';

/**
 * Notification Base Data
 * T: Object 
 */
interface Notification<T = {}> {
  origin: "selected"|"received";
  remote: boolean;
  data: T;
}

/**
 * Wraper Component
 * T: Object
 */
export class PushNotification<T = {}> extends React.Component<{
  getToken?: (token: string) => void;
  foreground?: (notification: Notification<T>) => void;
  background?: (notification: Notification<T>) => void;
}>{
  private _notificationSubscription: any|undefined;

  constructor(props: any){
    super(props);
  }

  private handleNotification = ( notification: Notification<T> ): void => {
    switch( notification.origin ){
      case "received":  // Foreground Process
        this.props.foreground && this.props.foreground(notification);
        break;

      case "selected":  // Background Process
        this.props.background && this.props.background(notification);
        break;
    }
  }
  
  public async componentDidMount(){
    try {
      // Check Permission
      const getResult = await Permissions.getAsync( Permissions.NOTIFICATIONS );
      if( getResult.status !== "granted" ){
        const askResult = await Permissions.askAsync( Permissions.NOTIFICATIONS );
        if( askResult.status !== "granted" ){
          return;
        }
      }

      // Get device token
      const token = await Notifications.getExpoPushTokenAsync();
      this.props.getToken && this.props.getToken( token );

      // Set handle
      this._notificationSubscription = Notifications.addListener( this.handleNotification );
    } catch (error) {
      console.log( error );
    }
  }

  public componentWillUnmount(){
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  public render(){
    return this.props.children;
  }
}