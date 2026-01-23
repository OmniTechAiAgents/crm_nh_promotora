import Header from './Header'
import Sidebar from './Sidebar'
import Content from './Content'
import './layout.css'

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Header />

      <div className="app-body">
        <Sidebar />
        <Content>
          {children}
        </Content>
      </div>
    </div>
  )
}
