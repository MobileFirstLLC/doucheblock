import Cocoa
import SafariServices.SFSafariApplication
import SafariServices.SFSafariExtensionManager

let appName = "DoucheBlock for Twitter"
let extensionBundleIdentifier = "me.mobilefirst.DoucheBlock.Extension"

class ViewController: NSViewController {

    @IBOutlet var appNameLabel: NSTextField!

    override func viewDidLoad() {
        super.viewDidLoad()
        self.appNameLabel.stringValue = appName
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            if let error = error {
                NSLog("%@", error.localizedDescription)
                DispatchQueue.main.async {
                    NSApp.presentError(error)
                }
                return
            }
            guard let state = state else {
                // This should in theory not be hit.
                NSLog("Could not get state.")
                return
            }
            DispatchQueue.main.async {
                if state.isEnabled {
                    self.appNameLabel.stringValue = "\(appName)'s extension is currently on."
                } else {
                    self.appNameLabel.stringValue = "\(appName)'s extension is currently off. You can turn it on in Safari Extensions preferences."
                }
            }
        }
    }
    override func viewDidAppear() {
            super.viewDidAppear()

            if let window = view.window {
                window.title = appName
                window.level = .floating
                window.styleMask = [.titled]
                window.center()
            }

            NSApp.activate(ignoringOtherApps: true)
        }

    @IBAction func openSafariExtensionPreferences(_ sender: AnyObject?) {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            if let error = error {
                NSLog("%@", error.localizedDescription)
                DispatchQueue.main.async {
                    NSApp.presentError(error)
                }
                return
            }
            DispatchQueue.main.async {
                NSApp.terminate(nil)
            }
        }
    }
}
