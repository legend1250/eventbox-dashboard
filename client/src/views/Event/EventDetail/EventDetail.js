import React, { Component } from 'react'
import { Link, Events, scroller } from 'react-scroll'
import { event } from '@gqlQueries'
import { message, Row, Spin, Col, Icon, Card, Button, BackTop, Divider, Modal } from 'antd'
import { client } from '@client'
import moment from 'moment'
// import 'moment/locale/vi'
import { Editor as EditorWysiwyg } from 'react-draft-wysiwyg'
import { convertFromRaw, EditorState } from 'draft-js'
import { withRouter } from 'react-router'
import './eventdetail.scss'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'


class EventDetailReview extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      event: undefined
    }
  }
  componentDidMount = async () => {
    const { eventId } = this.props.match.params

    let result
    try {
      result = await client.query({
        query: event.GET_EVENT_DETAIL,
        variables: { eventId }
      })
    } catch (error) {
      return message.error('Failed to fetch event')
    }
    this.setState({
      event: result.data.event,
      loading: false
    })

    Events.scrollEvent.register('begin', function() {
      // console.log('begin', arguments)
    })

    Events.scrollEvent.register('end', function() {
      // console.log('end', arguments)
    })
  }

  scrollTo = () => {
    scroller.scrollTo('scroll-to-element', {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart'
    })
  }

  scrollToWithContainer() {
    let goToContainer = new Promise((resolve, reject) => {
      Events.scrollEvent.register('end', () => {
        resolve()
        Events.scrollEvent.remove('end')
      })

      scroller.scrollTo('scroll-container', {
        duration: 800,
        delay: 0,
        smooth: 'easeInOutQuart'
      })
    })

    goToContainer.then(() =>
      /* eslint-disable */
      scroller.scrollTo('scroll-container-second-element', {
        duration: 800,
        delay: 0,
        smooth: 'easeInOutQuart',
        containerId: 'scroll-container'
      })
    )
  }

  componentWillUnmount() {
    Events.scrollEvent.remove('begin')
    Events.scrollEvent.remove('end')
  }

  render() {
    // console.log('event: ',this.state.event)
    const { event, loading } = this.state
    const { eventId } = this.props.match.params

    return (
      <Spin spinning={loading}>
        {event && (
          <div className='event-review-detail__wrapper'>
            <Row className='event-image-thumbnail__wrapper'>
              <img src={event && event.images.thumbnail} alt='thumbnail' />
            </Row>
            <Header event={event} className='event-header-info__wrapper' />
            <HeaderNav className='event-header-nav__wrapper' />
            <AboutEvent event={event} className='event-description__wrapper' />
            <AboutOrganization event={event} className='event-organization__wrapper' />
            <Divider />
            {/* <div style={{display: 'flex'}} >
              <div style={{marginRight: 18}} >
                <ApproveButton eventId={eventId} {...this.props} />
              </div>
              <div>
                <RejectButton eventId={eventId} {...this.props} />
              </div>
            </div> */}
            <div style={{ display: 'flex' }}>
              <div style={{ marginRight: 18 }}>
                <FeedbackButton eventId={eventId} {...this.props} />
              </div>
            </div>
            <BackTop />
          </div>
        )}
      </Spin>
    )
  }
}

const Header = (props) => {
  const { event } = props
  const time = moment(event.startTime)
  const explicitTime = moment(event.startTime).format('LLLL')

  return (
    <Row {...props}>
      <Col offset={4} span={4}>
        {/* {new Date(Number(event.startTime)).toDateString()} */}
        <div className='calendar-fake'>
          <div className='month'>{time.format('MMMM')}</div>
          <div className='date'>{time.format('DD')}</div>
          <div className='weekdate'>{time.format('dddd')}</div>
        </div>
      </Col>
      <Col span={8}>
        <div className='title'>{event.title}</div>
        <div className='start-time'>
          <Icon type='calendar' style={{ fontSize: 16, marginRight: 16 }} />{' '}
          {`${explicitTime.charAt(0).toUpperCase()}${explicitTime.substring(1)}`}
        </div>
        <div className='location'>
          <Icon type='environment' style={{ fontSize: 16, marginRight: 16 }} /> {event.location}
        </div>
        <div className='address'>{event.address}</div>
      </Col>
    </Row>
  )
}

const HeaderNav = (props) => {
  return (
    <Row {...props}>
      <Col offset={4}>
        <Row type='flex'>
          <div className='item'>
            <Link to='inTroduce' offset={-56} spy smooth duration={600}>
              Giới thiệu
            </Link>
          </div>
          {/* <div className='item'>
            <Link to='ticket' spy smooth duration={600}>Thông tin vé</Link>
          </div> */}
          <div className='item'>
            <Link to='organizer' offset={-56} spy smooth duration={800}>
              Nhà tổ chức
            </Link>
          </div>
        </Row>
      </Col>
    </Row>
  )
}

const AboutEvent = ({ className, event }) => (
  <div className={className} name='inTroduce'>
    <Card title='Giới thiệu'>
      <EditorWysiwyg
        editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(event.description)))}
        readOnly
        toolbarHidden
      />
    </Card>
  </div>
)

const AboutOrganization = ({ className, event }) => (
  <div className={className} name='organizer'>
    <Card title='Nhà tổ chức'>
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: 18 }}>
          <img
            src={event.organizationLogo}
            style={{ maxWidth: 132, maxHeight: 132 }}
            alt='organization_logo'
          />
        </div>
        <div>
          <div
            style={{
              color: '#000',
              fontWeight: 'bold',
              fontSize: 16
            }}
          >
            {event.organizationName}
          </div>
          <div>
            <p>{event.organizationDescription}</p>
          </div>
          <div>
            <Button type='primary' icon='mail'>
              Liên hệ nhà tổ chức
            </Button>
          </div>
        </div>
      </div>
    </Card>
  </div>
)
const GET_FEEDBACK = gql`
    query getEvent ($event: ID! ){
      event(id: $event){
        id 
        title
        feedback
        status
      }
    }
`
const FEEDBACKS = ({ eventId}) => (
 <Query query={GET_FEEDBACK} variables ={{ event :eventId }}>
 {({ loading, error, data }) => {
  if (loading) return "Loading...";
      if (error) return `Error! ${error.message}`;
      console.log(data)
      return (
       <p>{data.event.feedback}</p>
      );
    }}
 </Query>
)
class FeedbackButton extends Component {
  constructor(props) {
    super(props)
    this.state = {visible: false, value: null }
    this.toggleShow = this.toggleShow.bind(this)
    this.eveOk = this.eveOk.bind(this)
    this.evecancel = this.evecancel.bind(this)
  }
  toggleShow() {
    this.setState({visible : !this.state.visible})
  }
  eveOk() {
    this.setState({visible : false})
  }
  evecancel() {
    this.setState({visible : false})
  }
  render() {
    const { event, loading } = this.state
    const { eventId } = this.props.match.params
    // const { eventId } = this.props
    const self = this
      return (
            <div>
              <Button type='danger' onClick={self.toggleShow}>
                Phản hồi từ chối duyệt
              </Button>
              <Modal
                title="Phản Hồi Từ Chối Duyệt Sự Kiện"
                visible={self.state.visible}
                onOk={self.eveOk}
                onCancel={self.evecancel}
              >
              <div>
                  <p1><FEEDBACKS eventId={eventId} /></p1>
                </div>
              </Modal>
            </div>
          )}
}

export default withRouter(EventDetailReview)
